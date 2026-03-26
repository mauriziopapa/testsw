/* eslint-disable camelcase */
const express = require('express');
const CostiNonQualitaService = require('../../../services/kpi/CostiNonQualitaService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, tipologia, kpi_id, target } = req.query;
      const result = await CostiNonQualitaService.getKpiValues({ from, to, tipologia, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi CostiNonQualita: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
