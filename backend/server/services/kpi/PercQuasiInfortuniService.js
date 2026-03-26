/* eslint-disable camelcase */
const moment = require('moment');
const { buildDalAl, buildMonthInterval } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const KpiPersonaleService = require('../KpiPersonaleService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_QUASI_INFORTUNI = 14;
const KPI_ORE_LAVORATE = 15;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const monthInterval = buildMonthInterval(dal, al);
  const target = await TargetService.getTarget(inputTarget, kpi_id);
  let promises = monthInterval.map((month) => buildData(month, target));
  const dataValues = await Promise.all(promises);
  
  const ending = moment(al);

  for (let i = monthInterval.length - 1; i >= 0; i--) {
    const offset = i;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(11, 'months');
    const newTempo = buildMonthInterval(startingMonth, endingMonth);
    const kpiPromises = newTempo.map((month) => buildData(month, target));
    const sommaInterventi = await Promise.all(kpiPromises);

    const sum = sommaInterventi.reduce((sum, value) => sum + value.val, 0);
    const movingAverage = sum / 12;

    movingWindow.push(movingAverage);
  }

  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].average = movingWindow[i].toFixed(2);
  }

  dataValues.forEach((d) => {
    d.val = d.val.toFixed(2);
    results.push(d);
  });
  return results;
};

async function buildData(month, target) {
  const totQuasiInfortuni = await KpiPersonaleService.getKpi(month.number, month.year, KPI_QUASI_INFORTUNI);
  const totLavorate = await KpiPersonaleService.getKpi(month.number, month.year, KPI_ORE_LAVORATE);
  
  let val = 0;

  if (totLavorate.val > 0) {
    val = (totQuasiInfortuni.val / totLavorate.val) * 100;  
  }

  return {
    label:`${month.number}-${month.year}`,
    val,
    target
  }
}