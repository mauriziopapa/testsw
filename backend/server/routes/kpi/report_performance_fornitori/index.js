const express = require('express');
const moment = require('moment');
const { FORMAT_DATE } = require('../../../lib/time');
const ReportPerformanceFornitoriService = require('../../../services/kpi/ReportPerformanceFornitoriService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(
      `User ${req.user.username} requesting report performance fornitori file with useragent ${req.get('user-agent')}.`
    );
    try {
      const wb = await ReportPerformanceFornitoriService.getReport();
      const time = moment().format(FORMAT_DATE);
      return wb.write(`ReportPerformanceFornitori_${time}.xlsx`, res);
    } catch (error) {
      log.error(`Error getting kpi Report Performance Fornitori: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
