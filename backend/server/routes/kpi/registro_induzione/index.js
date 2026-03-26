const express = require('express');
const RegistroInduzioneService = require('../../../services/kpi/RegistroInduzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, cliente, pezzo, operatore, target } = req.query;
      const filters = {
        from,
        to,
        cliente,
        pezzo,
        operatore,
        target
      };
      const result = await RegistroInduzioneService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Registro Induzione : ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/clienti_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzioneService.getClienti();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting clienti for Registro Induzione : ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/pezzi_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzioneService.getPezzi();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting pezzi for Registro Induzione : ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/operatori_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzioneService.getOperatori();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting operatori for Registro Induzione : ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
