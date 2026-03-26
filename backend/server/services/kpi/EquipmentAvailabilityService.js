/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const ImpiantiAnagService = require('../ImpiantiAnagService');
const TempoMesiService = require('./TempoMesiService');

const {
  CAPACITA_TEORICA,
  SPENTO_MANUTENZIONE,
  SPENTO_MANSTRAO,
  STANDBY_MANSTRAO,
  EQUIPMENT_AVAILABILITY,
  TEMPO_DI_GUASTO
} = require('../../models/bi/KPIConstants');

const BIConstants = require('../../models/bi/BIConstants');

const { FORMAT_DATE } = require('../../lib/time');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValuesReparti = async (filters) => {
  const inMemoryValues = {
    capacita_teorica: 0,
    spento_manutenzione: 0,
    spento_manstrao: 0,
    standby_manstrao: 0,
    tempo_guasto: 0
  };

  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  let promises = [];
  promises.push(ImpiantiAnagService.findAllGruppi());
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [reparti, target] = await Promise.all(promises);

  const dal = moment(filters.from).format(FORMAT_DATE);
  const al = moment(filters.to).format(FORMAT_DATE);
  promises = reparti
    .filter((reparto) => !['TENIFER', 'POZZO', 'FVF', 'FVF-SZ', 'ALU'].includes(reparto.gruppo_impianto))
    .map((reparto) => this.buildDataReparto(reparto.gruppo_impianto, dal, al, target, inMemoryValues));

  let dataValues = await Promise.all(promises);
  // Calcolo valore medio generale per il periodo selezionato
  const val_medio = (
    1 -
    (inMemoryValues.spento_manutenzione + inMemoryValues.spento_manstrao + inMemoryValues.standby_manstrao) /
      inMemoryValues.capacita_teorica
  ).toFixed(3);

  const val_medio_ind = (
    1 -
    (inMemoryValues.spento_manutenzione + inMemoryValues.spento_manstrao + inMemoryValues.tempo_guasto) /
      inMemoryValues.capacita_teorica
  ).toFixed(3);

  // Resetto i contatori
  inMemoryValues.capacita_teorica = 0;
  inMemoryValues.spento_manutenzione = 0;
  inMemoryValues.spento_manstrao = 0;
  inMemoryValues.standby_manstrao = 0;
  inMemoryValues.tempo_guasto = 0;
  // Calcolo valore medio generale per il periodo selezionato meno un anno
  const dalPrec = moment(filters.from).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(filters.to).subtract(1, 'year').format(FORMAT_DATE);
  promises = reparti
    .filter((reparto) => !['TENIFER', 'POZZO', 'FVF', 'FVF-SZ', 'ALU'].includes(reparto.gruppo_impianto))
    .map((reparto) => this.buildDataReparto(reparto.gruppo_impianto, dalPrec, alPrec, target, inMemoryValues));

  await Promise.all(promises);
  // Calcolo valore medio generale per il periodo selezionato
  const val_medio_12m = (
    1 -
    (inMemoryValues.spento_manutenzione + inMemoryValues.spento_manstrao + inMemoryValues.standby_manstrao) /
      inMemoryValues.capacita_teorica
  ).toFixed(3);
  const val_medio_ind_12m = (
    1 -
    (inMemoryValues.spento_manutenzione + inMemoryValues.spento_manstrao + inMemoryValues.tempo_guasto) /
      inMemoryValues.capacita_teorica
  ).toFixed(3);

  dataValues.forEach((result) => {
    if (result.label === 'IND') {
      result.val_medio = (parseFloat(val_medio_ind) * 100).toFixed(3);
      result.val_medio_12m = (parseFloat(val_medio_ind_12m) * 100).toFixed(3);
    } else {
      result.val_medio = (parseFloat(val_medio) * 100).toFixed(3);
      result.val_medio_12m = (parseFloat(val_medio_12m) * 100).toFixed(3);
    }
  });
  return dataValues;
};

module.exports.buildDataReparto = async (reparto, dal, al, target, inMemoryValuesTotal) => {
  const capacita_teorica = await getKpiReparto(dal, al, reparto, CAPACITA_TEORICA);
  const spento_manutenzione = await getKpiReparto(dal, al, reparto, SPENTO_MANUTENZIONE);
  const spento_manstrao = await getKpiReparto(dal, al, reparto, SPENTO_MANSTRAO);
  const standby_manstrao = await getKpiReparto(dal, al, reparto, STANDBY_MANSTRAO);
  const tempo_di_guasto = await getKpiRepartoIND(dal, al, TEMPO_DI_GUASTO);

  let val = 0;
  if (reparto === 'IND') {
    val = (1 - (spento_manutenzione + spento_manstrao + tempo_di_guasto) / capacita_teorica).toFixed(3);
  } else {
    val = (1 - (spento_manutenzione + spento_manstrao + standby_manstrao) / capacita_teorica).toFixed(3);
  }
  // Devo incrementare i contatori per il calcolo del valore in media su tutto il periodo
  inMemoryValuesTotal.capacita_teorica += capacita_teorica;
  inMemoryValuesTotal.spento_manutenzione += spento_manutenzione;
  inMemoryValuesTotal.spento_manstrao += spento_manstrao;
  inMemoryValuesTotal.standby_manstrao += standby_manstrao;
  inMemoryValuesTotal.tempo_di_guasto += tempo_di_guasto;

  return {
    label: reparto,
    val: (parseFloat(val) * 100).toFixed(3),
    val_medio: 0,
    val_medio_12m: 0,
    target
  };
};

async function getKpiReparto(dal, al, reparto, fk_kpi) {
  const query = `
  SELECT
    SUM(IFNULL(valore, 0)) AS val
  FROM
    impianti_crud ic,
    impianti_anag ia
  WHERE
    fk_kpi = :fk_kpi
    AND STR_TO_DATE(CONCAT(ic.anno, '-', ic.mese, '-01'), '%Y-%m-%d') BETWEEN :dal AND :al 
    AND ia.gruppo_impianto = :reparto
    AND ia.id = ic.fk_impianto`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, reparto, fk_kpi },
    type: QueryTypes.SELECT
  });
  return kpi[0] ? kpi[0].val : 0;
}

async function getKpiRepartoIND(dal, al, fk_kpi) {
  const query = `
  SELECT
  IFNULL(SUM(IFNULL(val, 0)),0) AS val
  FROM
    kpi_produzione
  WHERE
    kpi = :fk_kpi
    AND STR_TO_DATE(CONCAT(anno, '-', mese, '-01'), '%Y-%m-%d') BETWEEN :dal AND :al 
    AND reparto = "IND"`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, fk_kpi },
    type: QueryTypes.SELECT
  });
  return kpi[0] ? kpi[0].val : 0;
}

module.exports.getKpiValues = async (filters) => {
  const inMemoryValues = {
    capacita_teorica: 0,
    spento_manutenzione: 0,
    spento_manstrao: 0,
    standby_manstrao: 0
  };

  const results = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { reparto, kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempoMese(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [tempo, target] = await Promise.all(promises);

  const from = moment(filters.from).format(FORMAT_DATE);
  const to = moment(filters.to).format(FORMAT_DATE);
  const val_medio = await this.buildDataReparto(reparto, from, to, target, inMemoryValues);

  const fromPrec = moment(filters.from).subtract(1, 'year').format(FORMAT_DATE);
  const toPrec = moment(filters.to).subtract(1, 'year').format(FORMAT_DATE);
  const val_medio_12m = await this.buildDataReparto(reparto, fromPrec, toPrec, target, inMemoryValues);

  const dataPromises = tempo.map((t) => buildData(t, reparto, target));
  const dataValues = await Promise.all(dataPromises);
  dataValues.forEach((d) => results.push(d));

  dataValues.forEach((result) => {
    result.val_medio = val_medio.val;
    result.val_medio_12m = val_medio_12m.val;
  });
  return results;
};

async function buildData(row, reparto, target) {
  const kpiValues = await getKpi(row, reparto);
  if (!kpiValues) {
    return {
      label: row.label,
      val: 0,
      val_medio: 0,
      val_medio_12m: 0,
      target
    };
  }

  return {
    label: row.label,
    val: (kpiValues.val * 100).toFixed(2),
    val_medio: 0,
    val_medio_12m: 0,
    target
  };
}

async function getKpi(row, reparto) {
  if (!reparto) {
    reparto = BIConstants.IND.label;
  }

  const query = `
  SELECT 
    ifnull(val, 0) AS val
  FROM kpi_produzione
  WHERE 
    kpi = :kpi AND anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { kpi: EQUIPMENT_AVAILABILITY, anno: row.anno, mese: row.mese, reparto },
    type: QueryTypes.SELECT
  });
  return kpi[0];
}
