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

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);

  const { target, tipologia, kpi_id } = filters;

  const tempo = await TempoMesiService.getTempo(dal, al);
  const targetLevel = await TargetService.getTarget(target, kpi_id);

  const promises = tempo.map((t) => buildData(t, tipologia, targetLevel));
  const results = await Promise.all(promises);

  return results;
};

async function buildData(tempo, tipologia, target) {
  const results = await getKpi(tempo, tipologia);
  const valori = new Value.Builder().setLabel('').setData(results).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori(valori).setTarget(target).build();
}

async function getKpi(tempo, tipologia) {
  const sql = `
  SELECT
    IFNULL(COUNT(*), 0) AS val,
    tag_name as name
  FROM
    zp_task_tags as zp
  LEFT JOIN tempo_mesi ON
    tempo_mesi.anno = YEAR(zp.start_date) AND tempo_mesi.mese_num = MONTH(zp.start_date)
  WHERE
    tempo_mesi.anno = :anno AND tempo_mesi.trimestre = :trimestre AND deleted = 0
    AND (tag_name = :tag_name OR "-tutti-" =:tag_name)
  GROUP BY
    tag_name`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { trimestre: tempo.trimestre, anno: tempo.anno, tag_name: tipologia },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.name).setData(k.val).build());
}
