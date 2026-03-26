/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const PIANO = 'PIANO MIGLIORAMENTO CONTINUO TEMPRASUD';

module.exports.getKpiValues = async (filters) => {
  const { year, tipologia, kpi_id } = filters;
  const inputTarget = filters.target;

  let promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  promises.push(getTags(tipologia));
  const [target, tags] = await Promise.all(promises);

  promises = tags.map((tag) => buildData(tag.tag_name, year, target));
  const results = await Promise.all(promises);

  return results;
};

async function buildData(tag_name, year, target) {
  // nuove
  const kpi_39 = await buildDataKpi39(tag_name, year);
  // chiuse in tempo
  const kpi_40 = await buildDataKpi40(tag_name, year);
  // chiuse in ritardo
  const kpi_41 = await buildDataKpi41(tag_name, year);
  // esito negativo
  const kpi_42 = await buildDataKpi42(tag_name, year);

  const nuove_39 = new Value.Builder().setLabel('# Aperte / In Corso').setData(kpi_39).build();
  const in_tempo_40 = new Value.Builder().setLabel('# Chiuse in tempo con esito positivo').setData(kpi_40).build();
  const in_ritardo_41 = new Value.Builder().setLabel('# Chiuse in ritardo con esito positivo').setData(kpi_41).build();
  const negative_42 = new Value.Builder().setLabel('# Chiuse con esito negativo/sospese').setData(kpi_42).build();

  // definisco l'array dei valori
  const data = [];
  // inserisco i valori
  data.push(in_tempo_40, in_ritardo_41, negative_42, nuove_39);

  const valori = new Value.Builder().setLabel('').setData(data).build();

  const targetValue = target || null;
  // inserisco l'array dei valori
  return new ValueGroup.Builder().setLabel(tag_name).setValori(valori).setTarget(targetValue).build();
}

async function buildDataKpi39(tag_name, anno) {
  const sql = `
    SELECT 
      IFNULL(COUNT(*), 0) AS val,
      tag_name as name
    FROM zp_task_tags
    WHERE  
      YEAR(start_date) <= :anno
      AND zp_task_tags.completed = 0 
      AND deleted = 0 
      AND (tag_name = :tag_name OR "-tutti-" =:tag_name)
      AND p_name LIKE '%${PIANO}%'
    GROUP BY
      tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tag_name },
    type: QueryTypes.SELECT
  });
  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi40(tag_name, anno) {
  const sql = `
  SELECT 
    IFNULL(COUNT(*), 0) AS val,
    tag_name as name
  FROM zp_task_tags
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task_tags.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task_tags.completed_time)
  WHERE  
  YEAR(zp_task_tags.completed_time) = :anno
  AND zp_task_tags.completed = 1 
  AND deleted = 0 
  AND completed_time <= end_date 
  AND status_name = 'Chiusa' 
  AND (tag_name = :tag_name OR "-tutti-" =:tag_name)
  AND p_name LIKE '%${PIANO}%'
  GROUP BY
    tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tag_name },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi41(tag_name, anno) {
  const sql = `
  SELECT 
    IFNULL(COUNT(*), 0) AS val,
    tag_name as name
  FROM zp_task_tags
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task_tags.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task_tags.completed_time)
  WHERE  
  YEAR(zp_task_tags.completed_time) = :anno
  AND zp_task_tags.completed = 1 
  AND deleted = 0 
  AND completed_time > end_date 
  AND status_name = 'Chiusa' 
  AND (tag_name = :tag_name OR "-tutti-" =:tag_name)
  AND p_name LIKE '%${PIANO}%'
  GROUP BY
    tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tag_name },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi42(tag_name, anno) {
  const sql = `
  SELECT 
    IFNULL(COUNT(*), 0) AS val,
    tag_name as name
  FROM zp_task_tags
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task_tags.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task_tags.completed_time)
  WHERE  
  YEAR(zp_task_tags.completed_time) = :anno
  AND zp_task_tags.completed = 1 
  AND deleted = 0 
  AND status_name = 'Archiviata'
  AND (tag_name = :tag_name OR "-tutti-" =:tag_name)
  AND p_name LIKE '%${PIANO}%'
  GROUP BY
    tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tag_name },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function getTags(tag_name) {
  const sql = `
  SELECT tag_name
  FROM zp_task_tags
  WHERE (tag_name = :tag_name OR "-tutti-" =:tag_name)
  GROUP BY tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { tag_name },
    type: QueryTypes.SELECT
  });

  return kpi;
}
