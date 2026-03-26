/* eslint-disable camelcase */
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const KpiPersonaleService = require('../KpiPersonaleService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_FERIE_RESIDUE = 12;
const KPI_ORE_STANDARD = 17;

module.exports.getKpiValues = async (filters) => {
  const results = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempoMese(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  promises.push(KpiPersonaleService.getKpiAverageInterval(dal, al, KPI_ORE_STANDARD));
  promises.push(KpiPersonaleService.getKpiAverageInterval(dal, al, KPI_FERIE_RESIDUE));
  const [tempo, target, averageStandardHours, averageHolidays] = await Promise.all(promises);

  const average = (averageHolidays / averageStandardHours) * 100;
  const dataPromises = tempo.map((t) => buildData(t, target));
  const dataValues = await Promise.all(dataPromises);
  const kpiAvg = new Value.Builder().setLabel('% Media del periodo').setData(average.toFixed(2)).build();
  dataValues.forEach((d) => {
    d.valori.push(kpiAvg);
    results.push(d);
  });
  return results;
};

async function buildData(tempo, target) {
  const totFerieResidue = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_FERIE_RESIDUE);
  const totStandard = await KpiPersonaleService.getKpi(tempo.mese, tempo.anno, KPI_ORE_STANDARD);

  let val = 0;
  if (totStandard.val > 0) {
    val = (totFerieResidue.val / totStandard.val) * 100;
  }

  const kpiVal = new Value.Builder().setLabel('% Ferie Residue del mese').setData(val.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori([kpiVal]).setTarget(target).build();
}
