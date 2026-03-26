/* eslint-disable no-await-in-loop */
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
    new excelCreator.ExcelCell('Commessa', 'string'),
    new excelCreator.ExcelCell('Codice Prodotto', 'string'),
    new excelCreator.ExcelCell('Descrizione Prodotto', 'string'),
    new excelCreator.ExcelCell('Pezzi', 'string'),
    new excelCreator.ExcelCell('Ore', 'string'),
    new excelCreator.ExcelCell('Pz/h', 'string'),
    new excelCreator.ExcelCell('Pz/h STD', 'string'),
    new excelCreator.ExcelCell('ID Contratto', 'string')
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
  const clientiXcel = [];
  for (let i = 0; i < kpis.length; i += 1) {
    const kpi = kpis[i];
    const { codiceProdotto, descProdotto, commessa, codiceContratto } = kpi;
    const ore = parseFloat(kpi.ore);
    const pezzi = parseInt(kpi.pezzi_mov);
    let pzh = 0;
    if (ore > 0 && pezzi > 0) {
      pzh = Math.round(pezzi / ore);
    }

    let pzhContratto = '0';
    let idContratto = `${codiceContratto}`;
    if (commessa != null && codiceCliente != null) {
      const result = await getPzhContratto(codiceCliente, commessa, codiceContratto);
      pzhContratto = result.pzhContratto.toString();
      idContratto = result.idContratto.toString();
    }

    const clienteXcel = [
      new excelCreator.ExcelCell(cliente.codice_anagrafica, 'string'),
      new excelCreator.ExcelCell(cliente.rag_sociale, 'string'),
      new excelCreator.ExcelCell(anno, 'number'),
      new excelCreator.ExcelCell(commessa, 'string'),
      new excelCreator.ExcelCell(codiceProdotto, 'string'),
      new excelCreator.ExcelCell(descProdotto, 'string'),
      new excelCreator.ExcelCell(pezzi, 'number'),
      new excelCreator.ExcelCell(ore, 'number'),
      new excelCreator.ExcelCell(pzh, 'number'),
      new excelCreator.ExcelCell(pzhContratto, 'string'),
      new excelCreator.ExcelCell(idContratto, 'string')
    ];
    clientiXcel.push(clienteXcel);
  }
  // Filtro via i clienti che non hanno pezzi
  return clientiXcel.filter((cl) => cl[3].value !== '' && cl[4].value !== '');
}

async function getKpi(codiceCliente, anno) {
  const query = `
  SELECT
    SUM(pezzi_mov) as pezzi_mov,
    pezzi_comm,
    PezziEvasi,
    SUM(ore) as ore,
    codiceCliente,
    codiceProdotto,
    descProdotto,
    commessa,
    IDLavorazione,
    codiceContratto
  FROM
    (
    SELECT
      mc.IDMovCommessa,
      IFNULL(mc.Pezzi, 0) AS pezzi_mov,
      co.Pezzi as pezzi_comm,
      co.PezziEvasi,
      IFNULL(mc.minuti_consuntivo, 0)/ 60 AS ore,
      co.\`Codice Cliente\` as codiceCliente,
      co.CodiceProdotto as codiceProdotto,
      co.\`Descrizione Prodotto\` as descProdotto,
      co.\`Numero Commessa\` as commessa,
      mc.IDLavorazione,
      co.CodiceContratto as codiceContratto
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
    codiceCliente,
    commessa
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

async function getPzhContratto(codiceCliente, commessa, codiceContratto) {
  const query = `SELECT
      ct.IDContratto,
      ct.IDCliente,
      c.\`Numero Commessa\`,
      ct.IDArticolo,
      cr.Sequenza,
      cr.PezziPerOra
    FROM
        contratti_testate ct
    INNER JOIN
        contratti_righe cr ON cr.IDContratto = ct.IDContratto
    INNER JOIN
        commesse c ON c.CodiceContratto = ct.IDContratto
    WHERE
        ct.IDCliente = :codiceCliente
        AND cr.PezziPerOra > 0
        AND c.\`Numero Commessa\` = :commessa;
    `;
  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { codiceCliente, commessa },
    type: QueryTypes.SELECT
  });

  if (kpi.length > 0) {
    return { pzhContratto: kpi[0].PezziPerOra, idContratto: kpi[0].IDContratto };
  }

  return { pzhContratto: '0', idContratto: `${codiceContratto}` };
}
