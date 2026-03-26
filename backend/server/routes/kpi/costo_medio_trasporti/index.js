const express = require('express');
const CostoMedioTrasportiService = require('../../../services/kpi/CostoMedioTrasportiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, zona, target } = req.query;
      const result = await CostoMedioTrasportiService.getKpiValues({ from, to, zona, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Resa Media Trasporti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/zone_trasporti_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await CostoMedioTrasportiService.getZones();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Resa Media Trasporti zone: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
