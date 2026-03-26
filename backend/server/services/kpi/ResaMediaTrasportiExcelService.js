/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getZones = async () => {
  const sql = `
        SELECT DISTINCT zona
        FROM excel_analisi_trasporti
        WHERE zona != "ZONA"
        UNION SELECT '-Tutte-'
        ORDER BY zona ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
};

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
  const sql = `
    SELECT 
      IFNULL(zona, :zona) as zona,
      IFNULL(AVG(resa_media), 0) AS val
    FROM tempo_mesi
    LEFT JOIN excel_analisi_trasporti AS e ON tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data) 
    WHERE (zona = :zona) AND tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { trimestre, anno, zona },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].val : 0;
  const label = kpi.length > 0 ? kpi[0].zona : '';
  return new Value.Builder().setLabel(label).setData(val).build();
}

async function buildDataAllZones(tempo, zone, target) {
  const zonePromises = zone.map((zona) => getValue(tempo.trimestre, tempo.anno, zona));
  const zoneValues = await Promise.all(zonePromises);

  return new ValueGroup.Builder().setLabel(tempo.label).setValori(zoneValues).setTarget(target).build();
}

async function getZone(zona) {
  let val = [];
  let kpi = [];
  let sql = 'SELECT DISTINCT zc.zona FROM excel_analisi_trasporti zc WHERE zona != "ZONA" ORDER BY zc.zona ASC';
  if (zona === '-Tutte-') {
    kpi = await dbBi.sequelizeBi.query(sql, {
      type: QueryTypes.SELECT
    });
  } else {
    sql = 'SELECT DISTINCT zc.zona FROM excel_analisi_trasporti zc WHERE zona = :zona ORDER BY zc.zona ASC';

    kpi = await dbBi.sequelizeBi.query(sql, {
      replacements: { zona },
      type: QueryTypes.SELECT
    });
  }
  val = kpi.map((el) => el.zona);
  return val;
}
