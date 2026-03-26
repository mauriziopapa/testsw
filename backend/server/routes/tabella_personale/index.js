/* eslint-disable camelcase */
const express = require('express');
const TabellaPersonaleService = require('../../services/TabellaPersonaleService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const attivita = await TabellaPersonaleService.getData(anno);
      return res.json(attivita);
    } catch (error) {
      log.error(`Error finding data for tabella personale: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const kpi_personale = req.body;
      const result = await TabellaPersonaleService.saveData(kpi_personale);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella personale: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
