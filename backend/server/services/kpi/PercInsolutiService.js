/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI = 8;

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const promises = [];
  promises.push(TempoMesiService.getTempoSemestre(dal, al));
  const [tempo] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildData(t));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildData(tempo) {
  const promises = [];
  promises.push();
  promises.push(getKpi(tempo.anno, tempo.semestre_num, KPI));
  promises.push(TargetService.getTarget(tempo.anno, 102));
  const [valori, target] = await Promise.all(promises);
  const value = new Value.Builder().setLabel('% Insoluti').setData(valori).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori(value).setTarget(target).build();
}

async function getKpi(anno, sem, kpi) {
  const query_kpi = `
  SELECT DISTINCT ifnull(val, 0) AS val
  FROM kpi_direzione 
  LEFT JOIN tempo_mesi ON tempo_mesi.anno = kpi_direzione.anno 
      AND tempo_mesi.semestre_num = kpi_direzione.sem AND tempo_mesi.semestre_num != 0
  WHERE 
    tempo_mesi.anno = :anno 
    AND tempo_mesi.semestre_num = :sem
    AND kpi = :kpi`;

  const result = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno, kpi, sem },
    type: QueryTypes.SELECT
  });
  if (result.length === 0) {
    return 0;
  }
  const last_elem = result.length - 1;
  return result[last_elem].val ? result[last_elem].val : 0;
}
