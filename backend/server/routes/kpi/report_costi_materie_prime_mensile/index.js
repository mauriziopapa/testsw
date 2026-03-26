/* eslint-disable camelcase */
const express = require('express');
const moment = require('moment');
const { FORMAT_DATE } = require('../../../lib/time');
const ReportCostiMateriePrimseMensiliService = require('../../../services/kpi/ReportCostiMateriePrimseMensiliService');
const FilterValue = require('../../../models/sapere/FilterValue');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(
      `User ${req.user.username} requesting report costi materie prime file with useragent ${req.get('user-agent')}.`
    );
    try {
      const { idwidget_instance } = req.query;
      const widgetFilters = await FilterValue.findAll({ where: { idwidget_instance } });
      const filterValues = widgetFilters.map((d) => d.default_value);
      const filters = {
        year: filterValues[0].split('-')[1],
        month: filterValues[0].split('-')[0]
      };
      const wb = await ReportCostiMateriePrimseMensiliService.getReport(filters);
      const time = moment().format(FORMAT_DATE);
      return wb.write(`ReportCostiMateriePrimeMensili_${time}.xlsx`, res);
    } catch (error) {
      log.error(`Error getting kpi Report Costi Materie Prime Mensili: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  function invertDateString(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    const parts = dateString.split('-');
    if (parts.length !== 2) {
      return null;
    }

    const [month, year] = parts;
    if (!/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) {
      return null;
    }

    return `${year}-${month}`;
  }

  return router;
};
