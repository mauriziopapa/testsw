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
  const results = [];

  const { year, kpi_id } = filters;
  const inputTarget = filters.target;

  const promises = [];
  // prendo owners dei taks
  promises.push(await getRisorse(year));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [risorse, target] = await Promise.all(promises);

  const dataPromises = risorse.filter((r) => r.owners_id != null).map((r) => buildData(r, year, target));
  const dataValues = await Promise.all(dataPromises);
  dataValues.map((d) => results.push(d));

  return results;
};

async function buildData(row, year, target) {
  if (row.owners_id != null) {
    // nuove
    const kpi_39 = await buildDataKpi39(row, year);
    // chiuse in tempo
    const kpi_40 = await buildDataKpi40(row, year);
    // chiuse in ritardo
    const kpi_41 = await buildDataKpi41(row, year);
    // esito negativo
    const kpi_42 = await buildDataKpi42(row, year);

    const nuove_39 = new Value.Builder().setLabel('# Aperte / In Corso').setData(kpi_39).build();
    const in_tempo_40 = new Value.Builder().setLabel('# Chiuse in tempo con esito positivo').setData(kpi_40).build();
    const in_ritardo_41 = new Value.Builder()
      .setLabel('# Chiuse in ritardo con esito positivo')
      .setData(kpi_41)
      .build();
    const negative_42 = new Value.Builder().setLabel('# Chiuse con esito negativo/sospese').setData(kpi_42).build();

    // definisco l'array dei valori
    const val_tmp = [];
    // inserisco i valori
    val_tmp.push(in_tempo_40, in_ritardo_41, negative_42, nuove_39);

    const targetValue = target || null;
    // inserisco l'array dei valori
    return new ValueGroup.Builder().setLabel(row.owners_name).setValori(val_tmp).setTarget(targetValue).build();
  }
  return {};
}

/*
 * Prelevo i dati
 * sia dalla tabella kpi_lab_qua: sono i dati congelati da excel non conformità fino al 2018
 * sia dalla tabella zp_task: sono i dai sincronizzati da ZohoProjects dal 2019
 */
async function buildDataKpi39(row, anno) {
  const sql = `
    SELECT 
      IFNULL(COUNT(*), 0) AS val
    FROM zp_task
    WHERE  
      YEAR(start_date) <= :anno
      AND zp_task.completed = 0 
      AND deleted = 0 
      AND owners_id = :owners_id
      AND p_name LIKE '%${PIANO}%'`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, owners_id: row.owners_id },
    type: QueryTypes.SELECT
  });
  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi40(row, anno) {
  const sql = `
  SELECT IFNULL(COUNT(*), 0) AS val
  FROM zp_task
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task.completed_time)
  WHERE  
  YEAR(zp_task.completed_time) = :anno
  AND zp_task.completed = 1 
  AND deleted = 0 
  AND completed_time <= end_date 
  AND status_name = 'Chiusa' AND owners_id = :owners_id
  AND p_name LIKE '%${PIANO}%'`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, owners_id: row.owners_id },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi41(row, anno) {
  const sql = `
  SELECT IFNULL(COUNT(*), 0) AS val
  FROM zp_task
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task.completed_time)
  WHERE  
  YEAR(zp_task.completed_time) = :anno
  AND zp_task.completed = 1 
  AND deleted = 0 
  AND completed_time > end_date 
  AND status_name = 'Chiusa' 
  AND owners_id = :owners_id
  AND p_name LIKE '%${PIANO}%'`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, owners_id: row.owners_id },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildDataKpi42(row, anno) {
  const sql = `
  SELECT IFNULL(COUNT(*), 0) AS val
  FROM zp_task
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = YEAR(zp_task.completed_time) 
      AND tempo_mesi.mese_num = MONTH(zp_task.completed_time)
  WHERE  
  YEAR(zp_task.completed_time) = :anno
  AND zp_task.completed = 1 
  AND deleted = 0 
  AND status_name = 'Archiviata'
  AND owners_id = :owners_id
  AND p_name LIKE '%${PIANO}%'`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, owners_id: row.owners_id },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function getRisorse(anno) {
  // "Sergio Rutigliano" da escludere come richiesta Temprasud
  const sql = `
  SELECT DISTINCT 
    owners_id,
    owners_name
  FROM zp_task
  WHERE owners_name != "Sergio Rutigliano"`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi;
}
