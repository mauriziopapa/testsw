/* eslint-disable camelcase */
const express = require('express');
const D8NuoviService = require('../../../services/kpi/D8NuoviService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, tipologia, kpi_id, target } = req.query;
      const result = await D8NuoviService.getKpiValues({ from, to, tipologia, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi 8d nuovi: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
