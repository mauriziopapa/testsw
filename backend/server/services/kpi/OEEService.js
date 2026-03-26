/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const RepartiService = require('../RepartiService');
const EquipmentAvailabilityService = require('./EquipmentAvailabilityService');
const EfficienzaProduttivaService = require('./EfficienzaProduttivaService');
const ProduttivitaInduzioneService = require('./ProduttivitaInduzioneService');
const TassoQualitaService = require('./TassoQualitaService');
const { buildDataWithMovingAverage } = require('../../lib/moving-average');

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

  const dataPromises = reparti.map((reparto) => buildDataReparti(dal, al, reparto.reparto, target, self));
  const dataValues = await Promise.all(dataPromises);

  return dataValues;
};

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { reparto, kpi_id } = filters;
  const callbackOptions = {
    options: {
      dal,
      al,
      target: inputTarget,
      kpi_id,
      reparto
    },
    callbacks: {
      buildData: buildData
    }
  };
  const result = await buildDataWithMovingAverage(callbackOptions);

  return result;
};

async function buildData({ row, reparto, target }) {
  const kpiValues = await getKpi(row, reparto);
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

async function buildDataReparti(dal, al, reparto, target, self) {
  let avg = 0;
  let avgPrec = 0;
  avg = await self.calculateValoreMedio(dal, al, reparto);

  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  avgPrec = await self.calculateValoreMedio(dalPrec, alPrec, reparto);

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
    kpi = 15 AND 
    anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno: row.anno, mese: row.mese, reparto },
    type: QueryTypes.SELECT
  });
  return kpi[0];
}

module.exports.calculateValoreMedio = async (dal, al, reparto) => {
  const inMemoryValues = {
    capacita_teorica: 0,
    spento_manutenzione: 0,
    spento_manstrao: 0,
    standby_manstrao: 0
  };

  const equipmentAvail = await EquipmentAvailabilityService.buildDataReparto(reparto, dal, al, 0, inMemoryValues);
  let efficienzaProduttiva = 0;
  let tassoQualita = 0;
  if (reparto === BIConstants.IND.label) {
    efficienzaProduttiva = (await ProduttivitaInduzioneService.calculateValoreMedio(dal, al, reparto)) / 100;
    // tasso qualita gestisce il reparto all'interno della funzione
    tassoQualita = (await TassoQualitaService.calculateValoreMedio(dal, al, null)) / 100;
  } else {
    efficienzaProduttiva = (await EfficienzaProduttivaService.calculateValoreMedio(dal, al, reparto)) / 100;
    tassoQualita = (await TassoQualitaService.calculateValoreMedio(dal, al, reparto)) / 100;
  }

  const valore = parseFloat(equipmentAvail.val / 100) * efficienzaProduttiva * tassoQualita;
  return valore * 100;
};
