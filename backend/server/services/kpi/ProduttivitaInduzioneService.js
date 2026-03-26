/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const { buildDataWithMovingAverage } = require('../../lib/moving-average');
const BIConstants = require('../../models/bi/BIConstants');

const { FORMAT_DATE } = require('../../lib/time');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

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
  const query_kpi = `
  SELECT 
    ifnull(val, 0) AS val
  FROM kpi_produzione
  WHERE 
    kpi = 1 AND 
    anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno: row.anno, mese: row.mese, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  return kpi[0];
}
