/* eslint-disable camelcase */
const moment = require('moment');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const KpiPersonaleService = require('../KpiPersonaleService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_ORE_FORMAZIONE = 22;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempoMese(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [tempo, target] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildData(t, target));
  const dataValues = await Promise.all(dataPromises);

  const ending = moment(al);

  for (let i = tempo.length - 1; i >= 0; i--) {
    const offset = i;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(11, 'months');
    const newTempo = await TempoMesiService.getTempoMese(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );

    const [dataForm] = await Promise.all([
      Promise.all(newTempo.map((t) => KpiPersonaleService.getKpi(t.mese, t.anno, KPI_ORE_FORMAZIONE)))
    ]);

    const sumForm = dataForm.reduce((acc, value) => acc + value.val, 0);
    const average = sumForm > 0 ? (sumForm / 12) * 100 : 0;

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

async function buildData(tempo, target) {
  const totFormazione = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_FORMAZIONE);

  let val = 0;
  // sulla tabella le percentuali sono salvate da 0 a 1
  if (totFormazione.val > 0) {
    val = totFormazione.val * 100;
  }

  const kpiVal = new Value.Builder().setLabel('% Formazione').setData(val.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori([kpiVal]).setTarget(target).build();
}
