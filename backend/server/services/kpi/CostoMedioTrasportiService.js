/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getZones = async () => {
  const sql = `
        SELECT DISTINCT zona
        FROM excel_analisi_trasporti
        UNION SELECT '-Tutte-'`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
};

module.exports.getKpiValues = async (filters) => {
  const data = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { zona } = filters;
  const inputTarget = filters.target;

  const promises = [];
  promises.push(getZone(zona));
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(inputTarget, 154));
  const [zone, tempo, target] = await Promise.all(promises);

  let dataPromises = [];
  if (zona !== '-Tutte-') {
    dataPromises = tempo.map((t) => buildData(t, zona, target));
  } else {
    dataPromises = tempo.map((t) => buildDataAllZones(t, zone, target));
  }
  const dataValues = await Promise.all(dataPromises);
  dataValues.map((d) => data.push(d));

  const results = { zone, data };
  return results;
};

async function getValue(trimestre, anno, zona) {
  const sql = `
    SELECT IFNULL(AVG(totale)/AVG(resa_media), 0) AS val
    FROM tempo_mesi
    LEFT JOIN excel_analisi_trasporti AS e ON tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data) 
    WHERE (zona = '${zona}') AND tempo_mesi.trimestre = '${trimestre}' AND tempo_mesi.anno = ${anno}`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  return val;
}

async function buildData(tempo, zona, target) {
  const val = await getValue(tempo.trimestre, tempo.anno, zona);

  return {
    label: tempo.label,
    values: [parseFloat(val).toFixed(2)],
    target
  };
}

async function buildDataAllZones(tempo, zone, target) {
  let media_tot = 0;
  let media_count = 0;
  const values = [];

  const zonePromises = zone.map((zona) => getValue(tempo.trimestre, tempo.anno, zona));
  const zoneValues = await Promise.all(zonePromises);

  zoneValues.forEach((val) => {
    media_tot += parseFloat(parseFloat(val).toFixed(2));
    media_count++;
    values.push(val);
  });

  return {
    label: tempo.label,
    values,
    media_generale: (media_tot / media_count).toFixed(2),
    target
  };
}

async function getZone(zona) {
  let val = [];
  if (zona === '-Tutte-') {
    const sql = 'SELECT DISTINCT zona FROM excel_analisi_trasporti';

    const kpi = await dbBi.sequelizeBi.query(sql, {
      type: QueryTypes.SELECT
    });

    val = kpi.map((el) => el.zona);
  }
  return val;
}
