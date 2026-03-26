/* eslint-disable camelcase */
const express = require('express');
const PPMScartiService = require('../../../services/kpi/PPMScartiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, tipologia, kpi_id, target } = req.query;
      const result = await PPMScartiService.getKpiValues({ from, to, tipologia, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi PPM Scarti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
