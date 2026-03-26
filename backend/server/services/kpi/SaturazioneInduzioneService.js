/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDataWithMovingAverage } = require('../../lib/moving-average');
const { buildDalAl } = require('../../lib/time');
const BIConstants = require('../../models/bi/BIConstants');

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, kpi_id } = filters;
  const callbackOptions = {
    options: {
      dal,
      al,
      target,
      kpi_id
    },
    callbacks: {
      buildData: buildData
    }
  };
  const result = await buildDataWithMovingAverage(callbackOptions);
  return result;
};

async function buildData({ row, target }) {
  const kpiValues = await getKpi(row);
  if (!kpiValues) {
    return {
      label: row.label,
      val: 0,
      val_medio: 0,
      target
    };
  }
  return {
    label: row.label,
    val: (kpiValues.val * 100).toFixed(2),
    val_medio: 0,
    target
  };
}

async function getKpi(row) {
  const query = `
    SELECT 
      ifnull(val, 0) AS val
    FROM kpi_produzione
    WHERE 
      kpi = 4 AND 
      anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno: row.anno, mese: row.mese, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  return kpi.length > 0 ? kpi[0] : { val: 0 };
}
