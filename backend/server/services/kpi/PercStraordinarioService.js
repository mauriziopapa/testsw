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

const KPI_ORE_STRAORDINARIO = 11;
const KPI_ORE_LAVORATE = 15;

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

    const [dataStrao, dataLav] = await Promise.all([
      Promise.all(newTempo.map((t) => KpiPersonaleService.getKpi(t.mese, t.anno, KPI_ORE_STRAORDINARIO))),
      Promise.all(newTempo.map((t) => KpiPersonaleService.getKpi(t.mese, t.anno, KPI_ORE_LAVORATE)))
    ]);
    const calcVal = dataStrao.map((currElement, index) =>
      dataLav[index].val > 0 ? (currElement.val / dataLav[index].val) * 100 : 0
    );
    const sum = calcVal.reduce((acc, value) => acc + value, 0);
    const average = sum > 0 ? sum / 12 : 0;

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
  const totStraordinario = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_STRAORDINARIO);
  const totStandard = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_LAVORATE);

  let val = 0;
  if (totStandard.val > 0) {
    val = (totStraordinario.val / totStandard.val) * 100;
  }

  const kpiVal = new Value.Builder().setLabel('% Straord. del mese').setData(val.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori([kpiVal]).setTarget(target).build();
}
