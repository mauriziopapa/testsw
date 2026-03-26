/* eslint-disable camelcase */
const express = require('express');
const LaboratorioService = require('../../../services/kpi/LaboratorioService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const result = await LaboratorioService.getKpiValues({ from, to, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Laboratorio Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
