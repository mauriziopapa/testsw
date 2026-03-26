/* eslint-disable camelcase */
const express = require('express');
const SaturazioneInduzioneService = require('../../../services/kpi/SaturazioneInduzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const filters = {
        from,
        to,
        target,
        kpi_id
      };
      const result = await SaturazioneInduzioneService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Saturazione Induzione Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
