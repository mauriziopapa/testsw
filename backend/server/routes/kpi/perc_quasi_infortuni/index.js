/* eslint-disable camelcase */
const express = require('express');
const PercQuasiInfortuniService = require('../../../services/kpi/PercQuasiInfortuniService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const result = await PercQuasiInfortuniService.getKpiValues({ from, to, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Perc Quasi Infortuni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
