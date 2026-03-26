/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { db } = require('../lib/db');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiInfo = async (widgetId) => {
  const sql = `select
    ins.idwidget_instance,
    ins.position,
    w.name,
    w.url,
    w.id,
    w.group,
    w.chart_width,
    w.chart_height,
    w.size,
    w.fonti,
    w.info_kpi,
    w.target,
    w.target2_title
  from
    widget_instance as ins
  left join widget as w on
    ins.idwidget = w.id
  where
    ins.idwidget_instance = ${widgetId}`;

  const info = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT
  });

  return info[0];
};
