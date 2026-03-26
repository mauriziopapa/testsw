/* eslint-disable camelcase */
const express = require('express');
const FatturatoCdlConfrontoService = require('../../../services/kpi/FatturatoCdlConfrontoService');
const CdlGruppiService = require('../../../services/CdlGruppiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, macroarea, kpi_id } = req.query;
      const result = await FatturatoCdlConfrontoService.getKpiValues({ from, to, macroarea, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Fatturato Cdl Confronto: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/macroaree_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await CdlGruppiService.getCdlGruppi();
      const mapped = result.map((r) => ({ id: r.GruppoCdL, macroarea: r.DescrizioneGruppoCdL }));
      const output = [{ id: '-Tutte-', macroarea: '-Tutte-' }].concat(mapped);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting cdl gruppi: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
