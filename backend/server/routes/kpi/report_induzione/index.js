const express = require('express');
const ReportInduzioneService = require('../../../services/kpi/ReportInduzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} requesting report induzione link with useragent ${req.get('user-agent')}.`);
    try {
      const result = await ReportInduzioneService.getReport();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Report Induzione Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
