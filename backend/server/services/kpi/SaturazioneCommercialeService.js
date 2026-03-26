/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const RepartiService = require('../RepartiService');
const TempoMesiService = require('./TempoMesiService');
const ImpiantiAnagService = require('../ImpiantiAnagService');
const ImpiantiService = require('../ImpiantiService');

const {
  CAPACITA_TEORICA,
  FESTIVITA,
  SPENTO_MANUTENZIONE,
  SPENTO_MANSTRAO,
  SPENTO_NO_MATERIALE
} = require('../../models/bi/KPIConstants');

const BIConstants = require('../../models/bi/BIConstants');

const { FORMAT_DATE } = require('../../lib/time');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValuesReparti = async (filters) => {
  const self = this;

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const promises = [];
  promises.push(RepartiService.getReparti(filters));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [reparti, target] = await Promise.all(promises);

  const dataPromises = reparti.map((reparto) => buildDataReparti(dal, al, reparto.reparto, target));
  const dataValues = await Promise.all(dataPromises);

  return dataValues;
};

module.exports.getKpiValues = async (filters) => {
  const results = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { reparto, kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempoMese(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [tempo, target] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildData(t, reparto, target));
  const dataValues = await Promise.all(dataPromises);
  dataValues.forEach((d) => results.push(d));

  const perc_valore = await calculateValoreMedio(dal, al, reparto);

  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const perc_valore_12m = await calculateValoreMedio(dalPrec, alPrec, reparto);
  results.forEach((result) => {
    result.val_medio = perc_valore.toFixed(2);
    result.val_medio_12m = perc_valore_12m.toFixed(2);
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
    val: kpiValues.val * 100,
    val_medio: 0,
    val_medio_12m: 0,
    target
  };
}

async function buildDataReparti(dal, al, reparto, target) {
  let avg = 0;
  let avgPrec = 0;
  avg = await calculateValoreMedio(dal, al, reparto);

  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  avgPrec = await calculateValoreMedio(dalPrec, alPrec, reparto);

  return {
    label: reparto,
    val: avg.toFixed(2),
    val_prec: avgPrec.toFixed(2),
    target
  };
}

async function getKpi(row, reparto) {
  const query_kpi = `
  SELECT 
    ifnull(val, 0) AS val
  FROM kpi_produzione
  WHERE 
    kpi = 4 AND 
    anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno: row.anno, mese: row.mese, reparto },
    type: QueryTypes.SELECT
  });
  return kpi[0];
}

async function calculateValoreMedio(dal, al, reparto) {
  if (!reparto) {
    reparto = BIConstants.IND.label;
  }
  let impianti = await ImpiantiAnagService.findAllByGruppo(reparto);
  impianti = impianti.map((impianto) => impianto.id);
  const capacita_teorica = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, CAPACITA_TEORICA, impianti);
  if (capacita_teorica === 0) {
    return 0;
  }

  const spento_no_materiale = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, SPENTO_NO_MATERIALE, impianti);
  const festivita = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, FESTIVITA, impianti);
  const spento_manutenzione = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, SPENTO_MANUTENZIONE, impianti);
  const spento_manstrao = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, SPENTO_MANSTRAO, impianti);

  const val =
    (capacita_teorica - spento_no_materiale - spento_manutenzione - spento_manstrao - festivita) / capacita_teorica;

  const perc_valore = val * 100;
  return perc_valore;
}
