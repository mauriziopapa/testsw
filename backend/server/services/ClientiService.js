/* eslint-disable no-param-reassign */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.getReportClienti = async (anno, top30) => {
  if (anno == null) {
    anno = new Date().getFullYear() - 1;
  }
  let top30condition = '';
  if (top30) {
    top30condition = 'top30 = 1 AND';
  }
  const sql = `
  SELECT DISTINCT
    cod_anagrafica as codice_anagrafica, 
    rag_sociale as rag_sociale,
    ${anno} as anno,
    fatturato,
    fatturato_prec,
    IFNULL(ROUND(fatturato / fatturato_prec * 100 - 100), 0) as variazione
  FROM riepilogo_clienti 
  WHERE ${top30condition} rag_sociale IS NOT NULL AND anno = ${anno}
  ORDER BY fatturato DESC `;

  const clienti = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return clienti;
};

module.exports.getClienti = async (anno) => {
  if (anno == null) {
    anno = new Date().getFullYear() - 1;
  }
  const sql = `
  SELECT DISTINCT
    cod_anagrafica as codice_anagrafica, 
    rag_sociale as rag_sociale,
    fatturato
  FROM riepilogo_clienti 
  WHERE top30 = 1 AND rag_sociale IS NOT NULL AND anno = ${anno}
  UNION ALL 
  SELECT '-Tutti-' AS codice_anagrafica, '-Tutti-' AS rag_sociale, 9999999 as fatturato
  ORDER BY fatturato DESC `;

  const clienti = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return clienti;
};

module.exports.getBudgetClienti = async (anno) => {
  // Forzatura chiesta da Gilda per 2022, provato ad impostare su db ma veniva sovrascritto ogni notte
  if (parseInt(anno) === 2022) {
    return 5990968;
  }

  const sql = `
  SELECT
    IFNULL(ROUND(SUM(budget)), 0) as budget
  FROM
    riepilogo_clienti rc
  where
    anno = :anno`;

  const budget = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return budget[0].budget;
};
