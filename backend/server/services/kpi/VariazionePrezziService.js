/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');

const KPIVariazionePrezziService = require('../KPIVariazionePrezziService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const { kpi_id } = filters;

  const promises = [];
  promises.push(getAnni(dal, al));
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

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM riepilogo_clienti
  WHERE anno >= :dal AND anno <= :al
  ORDER BY anno ASC`;

  const anni = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });
  return anni;
}

async function buildData(anno) {
  const promises = [];
  promises.push(getKpi(anno));
  const [variazione] = await Promise.all(promises);

  if (variazione == null) {
    return new Value.Builder().setLabel('Variazione % prezzi').setData(0).build();
  }

  return new Value.Builder().setLabel('Variazione % prezzi').setData(variazione).build();
}

async function getKpi(anno) {
  const result = await KPIVariazionePrezziService.findOneByAnno(anno);
  return result[0].variazione;
}
