/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, getMonthIntervalFromTrimestre } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getZonesForFilter = async () => getZonesForFilter();

module.exports.getKpiValues = async (filters) => {
  const data = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { zona, kpi_id } = filters;
  const inputTarget = filters.target;

  const promises = [];
  promises.push(getZone(zona));
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [zone, tempo, target] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildDataAllZones(t, zone, target));
  const dataValues = await Promise.all(dataPromises);
  dataValues.map((d) => data.push(d));

  const results = { zone, data };
  return results;
};

async function getValue(trimestre, anno, zona) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  const { val, label } = await getKgConsegna(from, to, zona);
  const totViaggi = await getTotViaggi(from, to, zona);

  const data = (val / totViaggi).toFixed(2);
  return new Value.Builder().setLabel(label).setData(data).build();
}

async function getKgConsegna(from, to, zona) {
  const sql = `
    SELECT 
      c.CodicePercorso,
      IFNULL(zc.zona, :zona) as zona,
      SUM(IFNULL(s.PesoConsegna, 0) ) as kg_andata
    FROM
      consegne c,
      soste s,
      zone_consegne zc 
    WHERE 
      c.IDConsegna = s.IDConsegna 
      AND c.CodicePercorso = zc.CodicePercorso 
      AND c.DataConsegna BETWEEN :from AND :to
      AND zc.zona = :zona
      `;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to, zona },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].kg_andata : 0;
  const label = kpi.length > 0 ? kpi[0].zona : '';
  return { val, label };
}

async function getTotViaggi(from, to, zona) {
  const sql = `
    SELECT DISTINCT 
      c.CodicePercorso,
      IFNULL(zc.zona, 'LAZIO') as zona,
      c.DataConsegna,
      c.NrConsegna
    FROM
      consegne c,
      zone_consegne zc 
    WHERE 
      c.CodicePercorso = zc.CodicePercorso 
      AND c.DataConsegna BETWEEN :from AND :to
      AND zc.zona = :zona
      `;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to, zona },
    type: QueryTypes.SELECT
  });

  return kpi.length;
}

async function buildDataAllZones(tempo, zone, target) {
  const zonePromises = zone.map((zona) => getValue(tempo.trimestre, tempo.anno, zona));
  const zoneValues = await Promise.all(zonePromises);
  return new ValueGroup.Builder().setLabel(tempo.label).setValori(zoneValues).setTarget(target).build();
}

async function getZone(zona) {
  let val = [];
  let kpi = [];
  let sql = 'SELECT zc.zona FROM zone_consegne zc ORDER BY zc.zona ASC';
  if (zona === '-Tutte-') {
    kpi = await dbBi.sequelizeBi.query(sql, {
      type: QueryTypes.SELECT
    });
  } else {
    sql = 'SELECT zc.zona FROM zone_consegne zc WHERE zona = :zona ORDER BY zc.zona ASC';

    kpi = await dbBi.sequelizeBi.query(sql, {
      replacements: { zona },
      type: QueryTypes.SELECT
    });
  }
  val = kpi.map((el) => el.zona);
  return val;
}

async function getZonesForFilter() {
  const sql = "SELECT zc.zona as zona FROM zone_consegne zc UNION SELECT '-Tutte-' as zona ORDER BY zona ASC ";

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
}
