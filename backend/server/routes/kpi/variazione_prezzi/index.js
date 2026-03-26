/* eslint-disable camelcase */
const express = require('express');
const VariazionePrezziService = require('../../../services/kpi/VariazionePrezziService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, kpi_id } = req.query;
      const result = await VariazionePrezziService.getKpiValues({ yearFrom, yearTo, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Variazione Prezzi Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
