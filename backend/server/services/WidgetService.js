/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { db } = require('../lib/db');
const Dashboard = require('../models/sapere/Dashboard');
const UserDashboard = require('../models/sapere/UserDashboard');
const WidgetInstance = require('../models/sapere/WidgetInstance');
const FilterValue = require('../models/sapere/FilterValue');

/*
 * Questo metodo serve per creare un'istanza di un nuovo widget per ogni dashboard utente, per la dashboard specificata.
 * Crea anche i filtri di default Dal mese, Al mese e Target
 * @param dashboard_url è l'url della dashboard a cui appartiene il widget
 * @param widget è il nuovo widget creato precedentemente, la funzione recupera l'id
 */
module.exports.createWidgetInstance = async (dashboard_url, widget) => {
  const widget_id = widget.id;
  const dashboard = await Dashboard.findOne({ where: { url: dashboard_url } });

  const user_dashboards = await UserDashboard.findAll({ where: { iddashboard: dashboard.iddashboard } });

  let promises = user_dashboards.map((ud) => createWidget(ud.iduser_dashboard, widget_id));
  const createdWidgets = await Promise.all(promises);

  promises = createdWidgets.map((created_widget) => createFilterValues(created_widget));
  const createdFilters = await Promise.all(promises);

  return createdWidgets;
};

/*
 * Questo metodo serve per creare un'istanza di un nuovo widget per la dashboard utente specificato,
 * per la dashboard specificata.
 * Crea anche i filtri di default Dal mese, Al mese e Target
 * @param dashboard_url è l'url della dashboard a cui appartiene il widget
 * @param widget è il nuovo widget creato precedentemente, la funzione recupera l'id
 */
module.exports.createWidgetInstanceForUser = async (dashboard_url, widget) => {
  const widget_id = widget.id;
  const iduser = widget.id_user;
  const dashboard = await Dashboard.findOne({ where: { url: dashboard_url } });

  const user_dashboards = await UserDashboard.findAll({ where: { iddashboard: dashboard.iddashboard, iduser } });

  let promises = user_dashboards.map((ud) => createWidget(ud.iduser_dashboard, widget_id));
  const createdWidgets = await Promise.all(promises);

  promises = createdWidgets.map((created_widget) => createFilterValues(created_widget));
  const createdFilters = await Promise.all(promises);

  return createdWidgets;
};

async function createFilterValues(created_widget) {
  const promises = [];

  // Filtro da mese
  const filter_dal = {
    idfilter: 18,
    default_value: '01-2023',
    idwidget_instance: created_widget.idwidget_instance,
    global: 1
  };
  // Filtro da anno
  const anno_dal = {
    idfilter: 37,
    default_value: '2021',
    idwidget_instance: created_widget.idwidget_instance,
    global: 1
  };
  promises.push(FilterValue.create(filter_dal));

  // Filtro al mese
  const filter_al = {
    idfilter: 19,
    default_value: '12-2023',
    idwidget_instance: created_widget.idwidget_instance,
    global: 1
  };
  // Filtro a anno
  const anno_al = {
    idfilter: 38,
    default_value: '2022',
    idwidget_instance: created_widget.idwidget_instance,
    global: 1
  };
  promises.push(FilterValue.create(filter_al));

  /*
  // Filtro per anno
  const anno = {
    idfilter: 39,
    default_value: '2022',
    idwidget_instance: created_widget.idwidget_instance,
    global: 1
  };
  promises.push(FilterValue.create(anno));
*/

  const target = {
    idfilter: 49, // <-- TARGET
    default_value: 2023,
    idwidget_instance: created_widget.idwidget_instance,
    global: 0
  };
  promises.push(FilterValue.create(target));

  /*
  const anno2 = {
    idfilter: 42,
    default_value: 5,
    idwidget_instance: created_widget.idwidget_instance,
    global: 0
  };
  promises.push(FilterValue.create(anno2));
  return Promise.all(promises);
  */
}

async function createWidget(iduser_dashboard, widget_id) {
  const visible = 1;
  const position = await WidgetInstance.max('position', { where: { user_dashboard: iduser_dashboard } });

  const widget_instance = {
    idwidget: widget_id,
    position: position + 1,
    user_dashboard: iduser_dashboard,
    visible
  };

  return WidgetInstance.create(widget_instance);
}
