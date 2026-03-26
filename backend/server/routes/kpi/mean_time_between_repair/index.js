/* eslint-disable camelcase */
const express = require('express');
const MeanTimeBetweenRepairService = require('../../../services/kpi/MeanTimeBetweenRepairService');
const RepartiService = require('../../../services/RepartiService');

const BIConstants = require('../../../models/bi/BIConstants');

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
      const output = result.map((r) => r.get({ plain: true })).concat({ reparto: BIConstants.IND.label });
      return res.json(output);
    } catch (error) {
      log.error(`Error getting reparti for Mean Time Between Reparti Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, reparto, kpi_id, target } = req.query;
      const filters = {
        from,
        to,
        reparto,
        kpi_id,
        target
      };
      let result = [];
      if (reparto) {
        result = await MeanTimeBetweenRepairService.getKpiValues(filters);
      } else {
        result = await MeanTimeBetweenRepairService.getKpiValuesReparti(filters);
      }
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Mean Time Between Repair: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
