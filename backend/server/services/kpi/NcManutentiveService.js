/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const moment = require('moment');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const NCRepartiService = require('./NCRepartiService');
const TempoMesiService = require('./TempoMesiService');
const KpiManutenzioneService = require('../KpiManutenzioneService');
const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_NC_MANUTENZIONE = 29;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const [tempo, target] = await Promise.all([
    TempoMesiService.getTempo(dal, al),
    TargetService.getTarget(inputTarget, kpi_id)
  ]);

  const dataPromises = tempo.map((t) => buildData(t, target, KPI_NC_MANUTENZIONE));
  const dataValues = await Promise.all(dataPromises);

  const ending = moment(al);

  for (let i = tempo.length - 1; i >= 0; i--) {
    const offset = i * 3;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );
    const kpiPromises = newTempo.map((t) => KpiManutenzioneService.getKpiSummTrimestre(t, KPI_NC_MANUTENZIONE));
    const sommaManutenzioneTrimestre = await Promise.all(kpiPromises);

    const sum = sommaManutenzioneTrimestre.reduce((acc, val) => acc + val, 0);
    const average = sommaManutenzioneTrimestre.length > 0 ? sum / sommaManutenzioneTrimestre.length : 0;

    movingWindow.push(average);
  }

  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].valori.push(new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build());
  }

  dataValues.forEach((d) => {
    results.push(d);
  });
  return results;
};

async function buildData(row, target, tipologia) {
  const val = await NCRepartiService.getSommaNC(row, tipologia);
  const value = new Value.Builder().setLabel('Val').setData(val.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(row.label).setValori([value]).setTarget(target).build();
}
