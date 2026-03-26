/* eslint-disable camelcase */
const express = require('express');
const SintesiImpiantiService = require('../../../services/kpi/SintesiImpiantiService');
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
      log.error(`Error getting reparti for Sintesi Impianti Service: ${error.message}`, error);
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
      const result = await SintesiImpiantiService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Sintesi Impianti Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
