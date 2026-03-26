/* eslint-disable camelcase */
const express = require('express');
const TassoQualitaService = require('../../../services/kpi/TassoQualitaService');
const RepartiService = require('../../../services/RepartiService');

const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/reparto_ts', [isAuthenticated], async (req, res) => {
    try {
      const { from, to } = req.query;
      const filters = { from, to };
      const result = await RepartiService.getReparti(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting reparti for Tasso Qualita Service: ${error.message}`, error);
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
        result = await TassoQualitaService.getKpiValues(filters);
      } else {
        result = await TassoQualitaService.getKpiValuesReparti(filters);
      }
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Tasso Qualita Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
