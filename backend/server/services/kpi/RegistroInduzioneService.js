/* eslint-disable no-plusplus */
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

  const promises = [];
  promises.push(TargetService.getTarget(inputTarget, 131));
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

  const row = await getKpi(dal, al, filters, target);

  row.forEach((r) => {
    tot_pezzi += parseInt(r.pezzi);
    tot_ore += parseInt(r.ore);
    ore_tmp = parseInt(r.ore);
    pezzi_tmp = parseInt(r.pezzi);

    result_tmp.push({
      label: r.commessa,
      target,
      pezzi: pezzi_tmp,
      ore: ore_tmp,
      pz_ora: (pezzi_tmp / ore_tmp).toFixed(2)
    });
  });

  pz_ora_ponderato = (tot_pezzi / tot_ore).toFixed(2);

  return {
    data: result_tmp,
    pz_ora_ponderato
  };
}

async function getKpi(dal, al, filters) {
  const query_kpi = `
  SELECT i.NumeroCommessa as commessa,
    AVG(IFNULL(i.prezzo, 0)) AS prezzo,
    SUM(IFNULL(mc.minuti_consuntivo/60, 0)) AS ore,
    SUM(IFNULL(mc.Pezzi, 0)) as pezzi
  FROM registro_induzione AS i, movimenti_commessa mc 
  WHERE 
    \`GiornoLavorazione\` >= date(:dal) AND 
    \`GiornoLavorazione\` <= date(concat(LAST_DAY(:al))) AND
    (i.CodiceCliente = :cliente OR '-Tutti-' = :cliente) AND
    ( i.IDProdotto = :pezzo OR '-Tutti-' = :pezzo) AND
    ( i.IDOperatore = :operatore OR '-Tutti-' = :operatore) AND
    i.NumeroCommessa = mc.NumeroCommessa AND
    mc.IDLavorazione = 'TI'
  GROUP BY commessa
  ORDER BY commessa
  `;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { dal, al, cliente: filters.cliente, pezzo: filters.pezzo, operatore: filters.operatore },
    type: QueryTypes.SELECT
  });
  return kpi;
}
