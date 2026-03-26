/* eslint-disable camelcase */
const express = require('express');
const GDC80PercService = require('../../../services/kpi/GDC80PercService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, tipologia, kpi_id } = req.query;
      const result = await GDC80PercService.getKpiValues({ from, to, tipologia, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi GDC 80 Perc: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
