const express = require('express');
const ResaCaricaMediaService = require('../../../services/kpi/ResaCaricaMediaService');
const ReportResaCaricaMediaService = require('../../../services/kpi/ReportResaCaricaMediaService');

const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, target } = req.query;
      const filters = {
        yearFrom,
        yearTo,
        target
      };
      const result = await ResaCaricaMediaService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Resa Carica Media Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/report', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} is requesting report resa carica media.`);
    try {
      const { anno, reparto } = req.query;
      const filters = { anno, reparto };
      const result = await ReportResaCaricaMediaService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Report Resa Carica Media Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
