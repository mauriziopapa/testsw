/* eslint-disable no-confusing-arrow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-await-in-loop */
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

const KPI_ORE_MALATTIA = 10;
const KPI_ORE_LAVORATE = 15;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const [tempo, target] = await Promise.all([
    TempoMesiService.getTempoMese(dal, al),
    TargetService.getTarget(inputTarget, kpi_id)
  ]);

  const dataValues = await Promise.all(tempo.map((t) => buildData(t, target)));

  const ending = moment(al);

  for (let i = tempo.length - 1; i >= 0; i -= 1) {
    const offset = i;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(11, 'months');
    const newTempo = await TempoMesiService.getTempoMese(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );

    const [dataMala, dataLav] = await Promise.all([
      Promise.all(newTempo.map((t) => KpiPersonaleService.getKpi(t.mese, t.anno, KPI_ORE_MALATTIA))),
      Promise.all(newTempo.map((t) => KpiPersonaleService.getKpi(t.mese, t.anno, KPI_ORE_LAVORATE)))
    ]);
    const calcVal = dataMala.map((currElement, index) =>
      dataLav[index].val > 0 ? (currElement.val / dataLav[index].val) * 100 : 0
    );
    const sum = calcVal.reduce((acc, value) => acc + value, 0);
    const average = sum > 0 ? sum / 12 : 0;

    movingWindow.push(average);
  }

  for (let i = 0; i < dataValues.length; i += 1) {
    dataValues[i].valori.push(new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build());
  }

  dataValues.forEach((d) => {
    results.push(d);
  });

  return results;
};

async function buildData(tempo, target) {
  const totMalattia = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_MALATTIA);
  const totLavorate = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_LAVORATE);

  let val = 0;
  // sulla tabella troviamo salvate le ore
  if (totLavorate.val > 0) {
    val = (totMalattia.val / totLavorate.val) * 100;
  }

  const kpiVal = new Value.Builder().setLabel('% Ass. del mese').setData(val.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori([kpiVal]).setTarget(target).build();
}
