/* eslint-disable camelcase */
const express = require('express');
const PercInvestimentoFormazioneService = require('../../../services/kpi/PercInvestimentoFormazioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, kpi_id } = req.query;
      const result = await PercInvestimentoFormazioneService.getKpiValues({ yearFrom, yearTo, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Perc Investimento Formazione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
