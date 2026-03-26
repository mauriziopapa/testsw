/* eslint-disable camelcase */
const express = require('express');
const EmissioniKPIService = require('../../../services/kpi/EmissioniKPIService');
const PuntiDiEmissioneService = require('../../../services/PuntiDiEmissioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, pde, kpi_id } = req.query;
      const result = await EmissioniKPIService.getKpiValues({ from, to, pde, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi emissioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/pde_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await PuntiDiEmissioneService.findAll();
      const mapped = result.map((r) => ({ id: r.id, pde: r.nome }));
      const output = [{ id: '-Tutti-', pde: '-Tutti-' }].concat(mapped);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting punti di emissione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
