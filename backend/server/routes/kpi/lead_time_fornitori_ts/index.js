/* eslint-disable camelcase */
const express = require('express');
const LeadTimeFornitoriTSService = require('../../../services/kpi/LeadTimeFornitoriTSService');
const FornitoriTSService = require('../../../services/FornitoriTSService');
const RischioService = require('../../../services/RischioService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/debug', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, fornitore, rischio, target, kpi_id } = req.query;
      const result = await LeadTimeFornitoriTSService.getDebugData({ from, to, fornitore, rischio, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting debug data for kpi Lead Time Fornitori TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, fornitore, rischio, target, kpi_id } = req.query;
      const result = await LeadTimeFornitoriTSService.getKpiValues({ from, to, fornitore, rischio, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Lead Time Fornitori TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/fornitori_con_ordini_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await FornitoriTSService.getAllFornitoriByCosto();
      const fornitori = result.map((r) => ({ id_fornitore: r.CodiceFornitore, nome_fornitore: r.RagioneSociale }));
      const output = [{ id_fornitore: '-Tutti-', nome_fornitore: '-Tutti-' }].concat(fornitori);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Fornitori TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/fornitori_con_ordini_ts/:rischio', [isAuthenticated], async (req, res) => {
    try {
      const { rischio } = req.params;
      const fornitoriByRischio = await FornitoriTSService.getFornitoriByRischioAndCosto(rischio);
      const fornitori = fornitoriByRischio.map((r) => ({
        id_fornitore: r.CodiceFornitore,
        nome_fornitore: r.RagioneSociale
      }));
      const output = [{ id_fornitore: '-Tutti-', nome_fornitore: '-Tutti-' }].concat(fornitori);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting Fornitori TS con livello di rischio: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/rischio_ts', [isAuthenticated], async (req, res) => {
    try {
      const output = RischioService.getRischi();
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Rischio TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
