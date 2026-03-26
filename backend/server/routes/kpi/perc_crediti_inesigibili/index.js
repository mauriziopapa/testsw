const express = require('express');
const PercCreditiInesigibiliService = require('../../../services/kpi/PercCreditiInesigibiliService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, target } = req.query;
      const filters = {
        yearFrom,
        yearTo,
        target
      };
      const result = await PercCreditiInesigibiliService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Perc Crediti Inesigibili Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
