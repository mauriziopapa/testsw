/* eslint-disable camelcase */
const express = require('express');
const NCRepartiService = require('../../../services/kpi/NCRepartiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, kpi_id, target, tipologia } = req.query;
      const result = await NCRepartiService.getKpiValues({ from, to, kpi_id, target, tipologia });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi NC Reparti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:area', [isAuthenticated], async (req, res) => {
    const { from, to, kpi_id, target } = req.query;
    const { area } = req.params;
    try {
      const result = await NCRepartiService.getKpiAreaValues({ from, to, area, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi NC Reparto for area=${area}: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
