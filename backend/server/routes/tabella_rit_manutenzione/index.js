/* eslint-disable camelcase */
const express = require('express');
const TabellaRitManutenzioneService = require('../../services/TabellaRitManutenzioneService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno, tipo } = req.query;
      const attivita = await TabellaRitManutenzioneService.getData(anno, tipo);
      return res.json(attivita);
    } catch (error) {
      log.error(`Error finding data for tabella ritardo manutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const kpi_cartellino = req.body;
      const result = await TabellaRitManutenzioneService.saveData(kpi_cartellino);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella ritardo manutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
