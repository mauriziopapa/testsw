/* eslint-disable max-len */
/* eslint-disable camelcase */
const express = require('express');
const FatturatoGruppiLavorazioneConfrontoService = require('../../../services/kpi/FatturatoGruppiLavorazioneConfrontoService');
const LavorazioniGruppiService = require('../../../services/LavorazioniGruppiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, macroarea, kpi_id } = req.query;
      const result = await FatturatoGruppiLavorazioneConfrontoService.getKpiValues({ from, to, macroarea, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Fatturato Gruppi Lavorazioni Confronto: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/macroaree_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await LavorazioniGruppiService.getLavorazioneGruppo();
      const mapped = result.map((r) => ({ id: r.GruppoLav, macroarea: r.DescrizioneGruppoLav }));
      const output = [{ id: '-Tutte-', macroarea: '-Tutte-' }].concat(mapped);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting lavorazioni gruppi: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
