/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI = 9;
const SEM = 2;

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const promises = [];
  promises.push(getAnni(dal, al));
  const [tempo] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildDataAnno(t));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildDataAnno(tempo) {
  const promises = [];
  promises.push();
  promises.push(buildData(tempo.anno));
  promises.push(TargetService.getTarget(tempo.anno, 106));
  const [valori, target] = await Promise.all(promises);
  return new ValueGroup.Builder().setLabel(tempo.anno).setValori([valori]).setTarget(target).build();
}

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM kpi_direzione
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
  promises.push(getKpi(anno, KPI, SEM));
  const [dati] = await Promise.all(promises);

  return new Value.Builder().setLabel('% Sofferenze').setData(dati.toFixed(2)).build();
}

async function getKpi(anno, kpi, sem) {
  const query_kpi = `
    SELECT val 
    FROM kpi_direzione
    WHERE anno = :anno 
      AND val IS NOT NULL 
      AND kpi = :kpi
      AND sem = :sem`;

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
