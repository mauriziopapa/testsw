/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (year) => {
  const results = await buildData(year);
  return results;
};

async function buildData(year) {
  const results = await getKpi(year);
  return [new ValueGroup.Builder().setLabel(year).setValori(results).build()];
}

async function getKpi(anno) {
  const sql = `
  SELECT 
    SUM(fatturato_macroaree.fatturato) AS fatturato,
    macroaree.macroarea as macroarea
  FROM fatturato_macroaree
  LEFT JOIN macroaree ON macroaree.id = fatturato_macroaree.macroarea
  WHERE anno = :anno 
  GROUP BY macroarea
  ORDER BY fatturato ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.macroarea).setData(k.fatturato).build());
}
