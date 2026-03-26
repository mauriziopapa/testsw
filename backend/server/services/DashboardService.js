/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { db } = require('../lib/db');
const Dashboard = require('../models/sapere/Dashboard');
const WidgetInstance = require('../models/sapere/WidgetInstance');

module.exports.findAll = async () => {
  const dashboards = await Dashboard.findAll();
  return dashboards;
};

module.exports.findOneById = async (id) => {
  const dashboard = await Dashboard.findByPk(id);
  return dashboard;
};

module.exports.findAllBy = async (properties) => {
  const where = {
    where: properties
  };
  const dashboard = await Dashboard.findAll(where);
  return dashboard;
};

module.exports.getDashboardWidgets = async (url, userId) => {
  const sql = `
    SELECT
      d.iddashboard as iddashboard,
      ud.iduser_dashboard as iduserdashboard,
      wi.idwidget_instance,
      wi.idwidget,
      w.name,
      w.url,
      w.ass_pos,
      wi.position
    from
      dashboard d,
      user_dashboard ud,
      widget_instance wi,
      widget w
    where
      d.url = '${url}'
      and ud.iddashboard = d.iddashboard
      and ud.iduser = ${userId}
      and wi.user_dashboard = ud.iduser_dashboard
      and w.id = wi.idwidget
      and wi.visible = 1
    order by wi.position `;

  const widgets = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT
  });

  return widgets;
};

module.exports.updateDashboard = async (dashboard) => Dashboard.update(dashboard);

module.exports.updateWidgetOrder = async (wi) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  WidgetInstance.update(
    {
      position: wi.position
    },
    { where: { idwidget_instance: wi.id } }
  );
