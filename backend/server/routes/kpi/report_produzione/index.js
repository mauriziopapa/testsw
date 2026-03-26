const express = require('express');
const ReportProduzioneService = require('../../../services/kpi/ReportProduzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} requesting report produzione link with useragent ${req.get('user-agent')}.`);
    try {
      const result = await ReportProduzioneService.getReportResaCaricaMedia();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Report Produzione Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
