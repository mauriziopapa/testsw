/* eslint-disable camelcase */
const express = require('express');
const RitardoMedioFornitoriTSService = require('../../../services/kpi/RitardoMedioFornitoriTSService');
const FornitoriTSService = require('../../../services/FornitoriTSService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, fornitore, target, kpi_id } = req.query;
      const result = await RitardoMedioFornitoriTSService.getKpiValues({ from, to, fornitore, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Ritardo Medio Fornitori TS: ${error.message}`, error);
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

  return router;
};
