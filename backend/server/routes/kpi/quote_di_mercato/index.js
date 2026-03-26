/* eslint-disable camelcase */
const express = require('express');
const QuoteDiMercatoService = require('../../../services/kpi/QuoteDiMercatoService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo } = req.query;
      const result = await QuoteDiMercatoService.getKpiValues({ yearFrom, yearTo });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting quote di mercato: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
