/* eslint-disable camelcase */
const express = require('express');
const CostoNonQualitaManutentiveService = require('../../../services/kpi/CostoNonQualitaManutentiveService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, kpi_id, target } = req.query;
      const result = await CostoNonQualitaManutentiveService.getKpiValues({ from, to, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Costo Non Qualità Manutentive: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
