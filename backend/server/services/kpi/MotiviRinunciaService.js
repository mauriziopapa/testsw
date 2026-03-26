const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const SezionaleOfferteService = require('../SezionaleOfferteTSService');

module.exports.getOfferTypesTeamSystem = async () => {
  const kpi = await SezionaleOfferteService.findAll();
  return kpi;
};

module.exports.getOfferTypes = async () => {
  const sql = `
  SELECT
    DISTINCT tipo_offerta AS tipo,
    tipo_offerta
  FROM
    offerte
  WHERE
    data_doc IS NOT NULL
    AND tipo_offerta != 'AUMENTO'
  UNION ALL
  SELECT
    '-Tutti-' AS tipo,
    '-Tutti-' AS tipo_offerta
  ORDER BY
    tipo`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
};

module.exports.getDefaultValuesTeamSystem = async (as) => {
  const sql = `
  SELECT
    Stato as motivazione,
    0 as "${as}"
  FROM teamsystem_offerte
  WHERE Stato != 'ACCETTATA'
  GROUP BY motivazione
  ORDER BY motivazione DESC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
};
