/* eslint-disable camelcase */
const express = require('express');
const OEEService = require('../../../services/kpi/OEEService');
const RepartiService = require('../../../services/RepartiService');

const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/reparto_ts', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, kpi_id } = req.query;
      const filters = { from, to, kpi_id };
      const result = await RepartiService.getReparti(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting reparti for OEE Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, reparto, kpi_id } = req.query;
      const filters = {
        from,
        to,
        target,
        reparto,
        kpi_id
      };
      let result = [];
      if (reparto) {
        result = await OEEService.getKpiValues(filters);
      } else {
        result = await OEEService.getKpiValuesReparti(filters);
      }
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi OEE Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
