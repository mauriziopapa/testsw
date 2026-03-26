/* eslint-disable camelcase */
const express = require('express');
const TabellaDirezioneService = require('../../services/TabellaDirezioneService');
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
      const results = await TabellaDirezioneService.getData(dal, al);
      return res.json(results);
    } catch (error) {
      log.error(`Error finding data for tabella direzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const kpi_direzione = req.body;
      const result = await TabellaDirezioneService.saveData(kpi_direzione);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella direzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
