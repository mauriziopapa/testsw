/* eslint-disable camelcase */
const express = require('express');
const FatturatoConfrontoService = require('../../../services/kpi/FatturatoConfrontoService');
const ClientiService = require('../../../services/ClientiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, cliente, kpi_id } = req.query;
      const result = await FatturatoConfrontoService.getKpiValues({ from, to, cliente, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Fatturato Confronto: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/clienti_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await ClientiService.getClienti();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting clienti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
