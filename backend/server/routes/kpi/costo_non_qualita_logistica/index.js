/* eslint-disable camelcase */
const express = require('express');
const CostoNonQualitaLogisticaService = require('../../../services/kpi/CostoNonQualitaLogisticaService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, kpi_id, target } = req.query;
      const result = await CostoNonQualitaLogisticaService.getKpiValues({ from, to, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Costo Non Qualità Logistica: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
