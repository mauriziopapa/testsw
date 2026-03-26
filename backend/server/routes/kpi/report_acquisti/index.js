const express = require('express');
const ReportAcquistiService = require('../../../services/kpi/ReportAcquistiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} requesting report acquisti link with useragent ${req.get('user-agent')}.`);
    try {
      const result = await ReportAcquistiService.getReport();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Report Acquisti Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
