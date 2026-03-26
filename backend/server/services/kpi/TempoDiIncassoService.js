/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const self = this;
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const { kpi_id } = filters;

  const promises = [];
  promises.push(getAnni(dal, al));
  const [tempo] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildDataAnno(t, kpi_id, self));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildDataAnno(tempo, kpi_id, self) {
  const promises = [];
  promises.push();
  promises.push(buildData(tempo.anno, self));
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

async function buildData(anno, self) {
  const promises = [];
  promises.push(self.getKpi(anno));
  const [giorni] = await Promise.all(promises);

  const data = Math.round(parseFloat(giorni));
  return new Value.Builder().setLabel('Tempo di Incasso').setData(data).build();
}

module.exports.getKpi = async (anno) => {
  const query_kpi = `
  SELECT giorni
  FROM tempi_incasso
  WHERE anno = :anno`;

  const result = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  if (result.length === 0) {
    return 0;
  }

  return result[0].giorni;
};

module.exports.setKpi = async (anno, valore) => {
  const query = `
  UPDATE tempi_incasso 
  SET giorni = :valore
  WHERE anno = :anno`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, valore },
    type: QueryTypes.UPDATE
  });

  return result;
};
