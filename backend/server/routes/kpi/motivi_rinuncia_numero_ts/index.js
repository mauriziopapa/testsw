/* eslint-disable camelcase */
const express = require('express');
const MotiviRinunciaNumeroTSService = require('../../../services/kpi/MotiviRinunciaNumeroTSService');
const MotiviRinunciaService = require('../../../services/kpi/MotiviRinunciaService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year, tipo_offerta } = req.query;
      const result = await MotiviRinunciaNumeroTSService.getKpiValues({ year, tipo_offerta });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Motivi Rinuncia Numero TS Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/tipi_offerte_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MotiviRinunciaService.getOfferTypesTeamSystem();
      const tipi_offerte = result.map((r) => ({ tipo: r.codice, tipo_offerta: r.descrizione }));
      const output = [{ tipo: '-Tutti-', tipo_offerta: '-Tutti-' }].concat(tipi_offerte);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting parametro tipi_offerte_ts Tipi Offerte: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
