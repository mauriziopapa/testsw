/* eslint-disable camelcase */
const TargetService = require('./TargetService');
const KpiPersonaleService = require('../KpiPersonaleService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_MOTIVAZIONE_PERS = 23;
const MESE = 12;

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const { kpi_id } = filters;

  const promises = [];
  promises.push(KpiPersonaleService.getAnni(dal, al));
  const [tempo] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildDataAnno(t, kpi_id));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildDataAnno(tempo, kpi_id) {
  const promises = [];
  promises.push();
  promises.push(buildData(tempo.anno));
  promises.push(TargetService.getTarget(tempo.anno, kpi_id));
  const [valori, target] = await Promise.all(promises);
  return new ValueGroup.Builder().setLabel(tempo.anno).setValori([valori]).setTarget(target).build();
}

async function buildData(anno) {
  const promises = [];
  promises.push(KpiPersonaleService.getKpiAndAnno(MESE, anno, KPI_MOTIVAZIONE_PERS));
  const [motivazionePersonale] = await Promise.all(promises);

  return new Value.Builder().setLabel('Motivazione dipendenti').setData(motivazionePersonale.val.toFixed(2)).build();
}
