/* eslint-disable camelcase */
const express = require('express');
const RapiditaManutenzioneService = require('../../../services/kpi/RapiditaManutenzioneService');
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
      const result = await RapiditaManutenzioneService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Rapidita Manutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
