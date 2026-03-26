/* eslint-disable camelcase */
const express = require('express');
const RegistroInduzionePonderatoService = require('../../../services/kpi/RegistroInduzionePonderatoService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, cliente, pezzo, operatore, kpi_id, target } = req.query;
      const filters = {
        from,
        to,
        cliente,
        pezzo,
        operatore,
        kpi_id,
        target
      };
      const result = await RegistroInduzionePonderatoService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Registro Induzione Ponderato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/clienti_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzionePonderatoService.getClienti();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting clienti for Registro Induzione Ponderato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/pezzi_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzionePonderatoService.getPezzi();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting pezzi for Registro Induzione Ponderato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/pezzi_ind_ts/:cliente', [isAuthenticated], async (req, res) => {
    try {
      const { cliente } = req.params;
      const result = await RegistroInduzionePonderatoService.getPezziCliente(cliente);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting pezzi for Registro Induzione Ponderato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/operatori_ind_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await RegistroInduzionePonderatoService.getOperatori();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting operatori for Registro Induzione Ponderato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
