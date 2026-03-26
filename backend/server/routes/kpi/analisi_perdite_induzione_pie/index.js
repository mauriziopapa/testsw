const express = require('express');
const AnalisiPerditeInduzioneService = require('../../../services/kpi/AnalisiPerditeInduzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year } = req.query;
      const result = await AnalisiPerditeInduzioneService.getKpiPIEValues(year);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Analisi Perdite Induzione PIE Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
