/* eslint-disable camelcase */
const express = require('express');
const TabellaConcorrentiService = require('../../services/TabellaConcorrentiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const dal = parseInt(req.query.yearFrom);
      const al = parseInt(req.query.yearTo);
      const results = await TabellaConcorrentiService.getData(dal, al);
      return res.json(results);
    } catch (error) {
      log.error(`Error finding data for tabella concorrenti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const kpi_concorrenti = req.body;
      const result = await TabellaConcorrentiService.saveData(kpi_concorrenti);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella concorrenti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
