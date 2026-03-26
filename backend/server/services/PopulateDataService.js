const KpiManutenzione = require('../models/bi/KpiManutenzione');
const KpiDirezione = require('../models/bi/KpiDirezione');

module.exports.populateAllDataDirezione = async (anni) => {
  const promises = anni.map((anno) => populateKpisDirezione(anno));
  const result = await Promise.all(promises);
  return result;
};

async function populateKpisDirezione(anno) {
  const kpis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const promises = kpis.map((kpi) => populateSemestre(anno, kpi));
  const result = await Promise.all(promises);
  return result;
}

async function populateSemestre(anno, kpi) {
  const val = 0;
  const semestri = [1, 2];
  const promises = semestri.map((sem) => KpiDirezione.create({ anno, sem, kpi, val }));
  const result = await Promise.all(promises);
  return result;
}

module.exports.populateAllDataManutenzione = async (anni) => {
  const promises = anni.map((anno) => populateKpis(anno));
  const result = await Promise.all(promises);
  return result;
};

module.exports.populateDataManutenzione = async (anni, kpi) => {
  const promises = anni.map((anno) => populateKpi(anno, kpi));
  const result = await Promise.all(promises);
  return result;
};

async function populateKpis(anno) {
  const kpis = [7, 8, 9, 4, 5, 6];
  const promises = kpis.map((kpi) => populateYear(anno, kpi));
  const result = await Promise.all(promises);
  return result;
}

async function populateKpi(anno, kpi) {
  const result = await populateYear(anno, kpi);
  return result;
}

async function populateYear(anno, kpi) {
  const val = 0;
  const mesi = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const promises = mesi.map((mese) => KpiManutenzione.create({ anno, mese, kpi, val }));
  const result = await Promise.all(promises);
  return result;
}
