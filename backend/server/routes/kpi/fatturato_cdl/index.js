const express = require('express');
const FatturatoCdlService = require('../../../services/kpi/FatturatoCdlService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year } = req.query;
      const result = await FatturatoCdlService.getKpiValues(year);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Fatturato Centri di Lavoro Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
