/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getOperatori = async () => {
  const sql = `
  SELECT DISTINCT 
  o.\`ID Operatore\` as id_operatore,
  o.NomeOperatore as nome_operatore
  FROM registro_induzione AS i 
  LEFT JOIN operatori AS o ON i.IDOperatore = o.\`ID Operatore\`
  UNION ALL
  SELECT 
  "-Tutti-" as id_operatore,
  "-Tutti-" as nome_operatore
  ORDER BY id_operatore`;

  const operatori = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return operatori.filter((operatore) => operatore.id_operatore !== null);
};

module.exports.getPezzi = async () => {
  const sql = `
  SELECT DISTINCT 
  co.IDProdotto as id_prodotto,
  CONCAT(co.CodiceProdotto, " - ", co.\`Descrizione Prodotto\`) as codice
  FROM registro_induzione AS i 
  LEFT JOIN commesse AS co ON i.NumeroCommessa = co.\`Numero Commessa\`
  UNION ALL 
  SELECT "-Tutti-" as id_prodotto, 
  "-Tutti-" as codice
  ORDER BY id_prodotto`;

  const pezzi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return pezzi.filter((pezzo) => pezzo.id_prodotto !== null);
};

module.exports.getPezziCliente = async (cliente) => {
  const sql = `
  SELECT DISTINCT 
  co.IDProdotto as id_prodotto,
  CONCAT(co.CodiceProdotto, " - ", co.\`Descrizione Prodotto\`) as codice
  FROM registro_induzione AS i 
  LEFT JOIN commesse AS co ON i.NumeroCommessa = co.\`Numero Commessa\`
  WHERE CodiceCliente = :cliente
  UNION ALL 
  SELECT "-Tutti-" as id_prodotto, 
  "-Tutti-" as codice
  ORDER BY id_prodotto`;

  const pezzi = await dbBi.sequelizeBi.query(sql, {
    replacements: { cliente },
    type: QueryTypes.SELECT
  });

  return pezzi.filter((pezzo) => pezzo.id_prodotto !== null);
};

module.exports.getClienti = async () => {
  const sql = `
  SELECT DISTINCT cl.codice_anagrafica,
  cl.rag_sociale
  FROM registro_induzione AS i 
  LEFT JOIN commesse AS co ON i.NumeroCommessa = co.\`Numero Commessa\`
  LEFT JOIN clienti AS cl ON cl.codice_anagrafica = co.\`Codice Cliente\`
  UNION ALL
  SELECT "-Tutti-" AS codice_anagrafica, 
  "-Tutti-" AS rag_sociale
  ORDER BY rag_sociale`;

  const clienti = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return clienti.filter((cliente) => cliente.rag_sociale !== null);
};

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target;
  const { kpi_id } = filters;

  const promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [target] = await Promise.all(promises);

  const results = await buildData(dal, al, filters, target);
  return results;
};

async function buildData(dal, al, filters, target) {
  const result_tmp = [];
  let tot_pezzi = 0;
  let tot_ore = 0;
  let pz_ora_ponderato = 0;
  let pezzi_tmp = 0;
  let ore_tmp = 0;

  const row = await getKpi(dal, al, filters);

  row.forEach((r) => {
    tot_pezzi += parseInt(r.pezzi);
    tot_ore += parseFloat(r.ore);
    ore_tmp = parseFloat(r.ore);
    pezzi_tmp = parseInt(r.pezzi);
    let pz_ora = 0;
    if (ore_tmp > 0) {
      pz_ora = (pezzi_tmp / ore_tmp).toFixed(2);
    }

    result_tmp.push({
      label: r.mese,
      target,
      pezzi: pezzi_tmp,
      ore: ore_tmp,
      pz_ora
    });
  });

  pz_ora_ponderato = (tot_pezzi / tot_ore).toFixed(2);

  return {
    data: result_tmp,
    pz_ora_ponderato
  };
}

async function getKpi(dal, al, filters) {
  const clientCondition = filters.cliente === '-Tutti-' ? '' : 'AND ri.CodiceCliente = :codiceCliente ';
  const productCondition = filters.pezzo === '-Tutti-' ? '' : 'AND ri.IDProdotto = :idProdotto ';
  const operatorCondition = filters.operatore === '-Tutti-' ? '' : 'AND mc.IDOperatore = :idOperatore ';

  const query_kpi = `
  SELECT 
    CONCAT(MONTH(GiornoConsuntivoFine), '-', YEAR(GiornoConsuntivoFine)) AS mese, 
    SUM(pezzi) AS pezzi, 
    SUM(ore) AS ore, 
    NumeroCommessa, 
    IDLavorazione, 
    CodiceCliente, 
    IDProdotto, 
    IDOperatore
  FROM (
    SELECT DISTINCT 
      mc.GiornoConsuntivoFine,
      IFNULL(mc.Pezzi, 0) AS pezzi,
      IFNULL(mc.minuti_consuntivo, 0) / 60 AS ore,
      mc.NumeroCommessa,
      mc.IDLavorazione,
      ri.CodiceCliente,
      ri.IDProdotto,
      mc.IDOperatore 
    FROM
      movimenti_commessa mc
    INNER JOIN registro_induzione ri ON
      ri.NumeroCommessa = mc.NumeroCommessa 
    WHERE
      mc.GiornoConsuntivoFine BETWEEN :dal AND :al
      ${clientCondition}
      ${productCondition}
      ${operatorCondition}
      AND  mc.IDLavorazione in ("TI-MF", "TI-HF", "TI")
    ORDER BY mc.GiornoConsuntivoFine
  ) as q 
  GROUP BY CONCAT(MONTH(GiornoConsuntivoFine), '-', YEAR(GiornoConsuntivoFine))
  ORDER BY YEAR(GiornoConsuntivoFine), MONTH(GiornoConsuntivoFine)
`;

  /*
  const const_mesi = `
  \`GiornoLavorazione\` >= date('${dal}') 
  AND \`GiornoLavorazione\` <= date(concat(LAST_DAY('${al}')))`;

  const query_kpi = `
  SELECT
    CONCAT(MONTH(i.GiornoLavorazione), '-', YEAR(i.GiornoLavorazione)) AS mese
    , SUM(IFNULL(i.PezziLavorati, 0)) AS pezzi
    , SUM(IFNULL(i.OreTotaliLavorate, 0)/60) AS ore
    , SUM(IFNULL(i.TempoSetup, 0)/60) AS TempoSetup
    , SUM(IFNULL(i.TempoMessaAPunto, 0)/60) AS TempoMessaAPunto
    , SUM(IFNULL(i.TempoGuasto, 0)/60) AS TempoGuasto
    , SUM(IFNULL(i.TempoCostruzioneInduttore, 0)/60) AS TempoCostruzioneInduttore
    , SUM(IFNULL(i.TempoRitardoLaboratorio, 0)/60) AS TempoRitardoLaboratorio
    , SUM(IFNULL(i.TempoAssenzaEnergia, 0)/60) AS TempoAssenzaEnergia
    , SUM(IFNULL(i.TempoManutenzioneOrdinaria, 0)/60) AS TempoManutenzioneOrdinaria
    , SUM(IFNULL(i.TempoFormazione, 0)/60) AS TempoFormazione
    , SUM(IFNULL(i.TempoAltreAttivita, 0)/60) AS TempoAltreAttivita
    , SUM(IFNULL(i.TempoPulizia, 0)/60) AS TempoPulizia
    FROM registro_induzione AS i
    WHERE ${const_mesi} AND
    (i.CodiceCliente = '${filters.cliente}' OR '-Tutti-' = '${filters.cliente}') AND
    ( i.IDProdotto = '${filters.pezzo}' OR '-Tutti-' = '${filters.pezzo}') AND
    ( i.IDOperatore = '${filters.operatore}' OR '-Tutti-' = '${filters.operatore}')
    GROUP BY CONCAT(MONTH(i.GiornoLavorazione), '-', YEAR(i.GiornoLavorazione))
    ORDER BY YEAR(i.GiornoLavorazione), MONTH(i.GiornoLavorazione)
  `;
  */

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: {
      dal,
      al,
      codiceCliente: filters.cliente,
      idProdotto: filters.pezzo,
      idOperatore: filters.operatore
    },
    type: QueryTypes.SELECT
  });
  return kpi;
}
