/* eslint-disable camelcase */
const express = require('express');
const EnergiaConsumataService = require('../../../services/kpi/EnergiaConsumataService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/debug', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const result = await EnergiaConsumataService.getDebugData({ from, to, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting debug data for kpi Energia Consumata: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, target, kpi_id } = req.query;
      const result = await EnergiaConsumataService.getKpiValues({ yearFrom, yearTo, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi energia consumata: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
