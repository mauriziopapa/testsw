/* eslint-disable camelcase */
const express = require('express');
const PuntualitaMateriePrimeTSService = require('../../../services/kpi/PuntualitaMateriePrimeTSService');
const FornitoriTSService = require('../../../services/FornitoriTSService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, fornitore, target, kpi_id } = req.query;
      const result = await PuntualitaMateriePrimeTSService.getKpiValues({ from, to, fornitore, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Puntualita Materie Prime TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/fornitori_mp_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await FornitoriTSService.getFornitoriMPByCosto();
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
