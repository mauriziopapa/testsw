/* eslint-disable camelcase */
const express = require('express');
const PercFormazioneService = require('../../../services/kpi/PercFormazioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const result = await PercFormazioneService.getKpiValues({ from, to, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Perc Formazione Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
