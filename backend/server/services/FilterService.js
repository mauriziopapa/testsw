/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const ResaMediaTrasportiService = require('./kpi/ResaMediaTrasportiService');
const FilterValue = require('../models/sapere/FilterValue');
const { db } = require('../lib/db');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getFiltersValues = async (widgetId) => {
  const sql = `select val.idfilter_values, val.idfilter, val.default_value, 
  val.global, val.idwidget_instance, val.locked_value, val.title, 
  filter.type, ifnull(val.label, filter.label) as lbl, filter.source, filter.name, 
  filter.option_list, filter.type_extra, val.width_custom 
  from filter_values as val left join filter on 
  val.idfilter = filter.idfilter 
  where val.idwidget_instance = ${widgetId} 
  order by val.position ASC`; // val.idfilter,

  const filters = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT
  });

  return filters;
};

module.exports.saveFiltersValues = async (widgetId, filterValues) => {
  const promises = filterValues.map((fv) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    FilterValue.update(
      { default_value: fv.default_value },
      {
        where: {
          idfilter_values: fv.idfilter_values,
          idfilter: fv.idfilter,
          idwidget_instance: widgetId
        }
      }
    )
  );
  const results = await Promise.all(promises);
  return results;
};

module.exports.getGlobalFilters = async (iddashboard) => {
  const sql = `select
      distinct filter.idfilter,
      filter.type,
      filter.label,
      filter.source,
      filter.name,
      filter.option_list,
      filter.title,
      filter.global,
      filter.type_extra
    from
      filter
    where
      idfilter in (
      select
        idfilter
      from
        filter_values
      left join widget_instance 
      on
        filter_values.idwidget_instance = widget_instance.idwidget_instance
      where
        widget_instance.user_dashboard = ${iddashboard})
      and global = 1
    order by
    filter.idfilter`;

  const filters = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT
  });

  return filters;
};

module.exports.getGlobalFiltersValues = async (filterName) => {
  let result = {};
  switch (filterName) {
    case 'zone_trasporti_ts':
      result = await ResaMediaTrasportiService.getZonesForFilter();
      break;
    default:
      break;
  }
  return result;
};
