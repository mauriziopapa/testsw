/* eslint-disable camelcase */
const express = require('express');
const RODConcorrentiService = require('../../../services/kpi/RODConcorrentiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, target, kpi_id } = req.query;
      const filters = {
        yearFrom,
        yearTo,
        target,
        kpi_id
      };
      const result = await RODConcorrentiService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi ROD Concorrenti Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
