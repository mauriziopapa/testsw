/* eslint-disable camelcase */
const express = require('express');
const InternalNCService = require('../../../services/kpi/InternalNCService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target, kpi_id } = req.query;
      const result = await InternalNCService.getKpiValues({ from, to, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Internal NC: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
