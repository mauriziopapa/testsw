/* eslint-disable camelcase */
const express = require('express');
const FatturatoMacroareeConfrontoService = require('../../../services/kpi/FatturatoMacroareeConfrontoService');
const MacroareeService = require('../../../services/MacroareeService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, macroarea, kpi_id } = req.query;
      const result = await FatturatoMacroareeConfrontoService.getKpiValues({ from, to, macroarea, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Fatturato Macroaree Confronto: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/macroaree_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MacroareeService.getMacroaree();
      const output = [{ id: '-Tutte-', macroarea: '-Tutte-' }].concat(result);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting macroaree: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
