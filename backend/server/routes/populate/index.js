const express = require('express');
const { isNotNumber } = require('../../lib/utils');
const PopulateDataService = require('../../services/PopulateDataService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/manutenzione', [isAuthenticated], async (req, res) => {
    try {
      const { da, a } = req.query;
      if (da == null || a == null || isNotNumber(da) || isNotNumber(a) || da < 2022 || a > 2050 || a < da) {
        return res.sendStatus(400);
      }
      const anni = [];
      for (let i = parseInt(da); i <= parseInt(a); i += 1) {
        anni.push(i);
      }
      const results = await PopulateDataService.populateAllDataManutenzione(anni);
      return res.json(results);
    } catch (error) {
      log.error(`Error populateAllDataManutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/direzione', [isAuthenticated], async (req, res) => {
    try {
      const { da, a } = req.query;
      if (da == null || a == null || isNotNumber(da) || isNotNumber(a) || da < 2022 || a > 2050 || a < da) {
        return res.sendStatus(400);
      }
      const anni = [];
      for (let i = parseInt(da); i <= parseInt(a); i += 1) {
        anni.push(i);
      }
      const results = await PopulateDataService.populateAllDataDirezione(anni);
      return res.json(results);
    } catch (error) {
      log.error(`Error populateAllDataDirezione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/manutenzione/:kpi', [isAuthenticated], async (req, res) => {
    try {
      const { kpi } = req.params;
      const { da, a } = req.query;
      if (da == null || a == null || isNotNumber(da) || isNotNumber(a) || da < 2022 || a > 2050 || a < da) {
        return res.sendStatus(400);
      }
      const anni = [];
      for (let i = parseInt(da); i <= parseInt(a); i += 1) {
        anni.push(i);
      }
      const results = await PopulateDataService.populateDataManutenzione(anni, kpi);
      return res.json(results);
    } catch (error) {
      log.error(`Error populateDataManutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
