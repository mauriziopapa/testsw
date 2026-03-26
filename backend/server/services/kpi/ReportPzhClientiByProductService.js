const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const ClientiService = require('../ClientiService');

const excelCreator = require('../../lib/excel-creator');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COLUMN_WIDTH = 20;

module.exports.getReport = async () => {
  const year = new Date().getFullYear();
  const yearPrec = new Date().getFullYear() - 1;

  const top30 = true;
  const promises = [year, yearPrec].map((y) => ClientiService.getReportClienti(y, top30));
  const [clientiCurrentY, clientiPrevY] = await Promise.all(promises);

  const excelDataCurrentY = await getExcelData(clientiCurrentY);
  const excelDataPrevY = await getExcelData(clientiPrevY);

  const excelData = excelDataCurrentY.concat(excelDataPrevY).flatMap((a) => a);

  const header = [
    new excelCreator.ExcelCell('Codice Anagrafica', 'string'),
    new excelCreator.ExcelCell('Cliente', 'string'),
    new excelCreator.ExcelCell('Anno', 'string'),
    new excelCreator.ExcelCell('Codice Prodotto', 'string'),
    new excelCreator.ExcelCell('Descrizione Prodotto', 'string'),
    new excelCreator.ExcelCell('Pezzi', 'string'),
    new excelCreator.ExcelCell('Ore', 'string'),
    new excelCreator.ExcelCell('Pz/h', 'string')
  ];

  const wb = excelCreator.create('Clienti', header, excelData, COLUMN_WIDTH);
  return wb;
};

async function getExcelData(clienti) {
  const promises = clienti.map((cliente) => buildExcelData(cliente));
  const excelData = await Promise.all(promises);
  return excelData;
}

async function buildExcelData(cliente) {
  const codiceCliente = cliente.codice_anagrafica;
  const { anno } = cliente;

  const [kpis] = await Promise.all([getKpi(codiceCliente, anno)]);
  const clientiXcel = kpis.map((kpi) => {
    const { codiceProdotto, descProdotto } = kpi;
    const ore = parseFloat(kpi.ore);
    const pezzi = parseInt(kpi.pezzi_mov);
    let pzh = 0;
    if (ore > 0 && pezzi > 0) {
      pzh = Math.round(pezzi / ore);
    }

    const clienteXcel = [
      new excelCreator.ExcelCell(cliente.codice_anagrafica, 'string'),
      new excelCreator.ExcelCell(cliente.rag_sociale, 'string'),
      new excelCreator.ExcelCell(anno, 'number'),
      new excelCreator.ExcelCell(codiceProdotto, 'string'),
      new excelCreator.ExcelCell(descProdotto, 'string'),
      new excelCreator.ExcelCell(pezzi, 'number'),
      new excelCreator.ExcelCell(ore, 'number'),
      new excelCreator.ExcelCell(pzh, 'number')
    ];
    return clienteXcel;
  });
  // Filtro via i clienti che non hanno pezzi
  return clientiXcel.filter((cl) => cl[3].value !== '' && cl[4].value !== '');
}

async function getKpi(codiceCliente, anno) {
  const query = `
  SELECT
    SUM(pezzi_mov) as pezzi_mov,
    SUM(ore) as ore,
    codiceCliente,
    codiceProdotto,
    descProdotto,
    IDLavorazione
  FROM
    (
    SELECT
      mc.IDMovCommessa,
      IFNULL(mc.Pezzi, 0) AS pezzi_mov,
      IFNULL(mc.minuti_consuntivo, 0)/ 60 AS ore,
      co.\`Codice Cliente\` as codiceCliente,
      co.CodiceProdotto as codiceProdotto,
      co.\`Descrizione Prodotto\` as descProdotto,
      mc.IDLavorazione
    FROM
      movimenti_commessa mc
    LEFT JOIN commesse AS co ON
      mc.NumeroCommessa = co.\`Numero Commessa\`
    WHERE
      YEAR(mc.GiornoConsuntivoFine) = :anno
      AND co.\`Codice Cliente\` = :codiceCliente
      AND mc.IDLavorazione in ("TI-MF", "TI-HF", "TI")
      ) as q
  GROUP BY
    codiceProdotto,
    codiceCliente
  ORDER BY
    codiceCliente`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, codiceCliente },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    return [
      {
        pezzi: 0,
        ore: 0,
        codiceCliente,
        idProdotto: '',
        codiceProdotto: '',
        descProdotto: ''
      }
    ];
  }

  return kpi;
}
