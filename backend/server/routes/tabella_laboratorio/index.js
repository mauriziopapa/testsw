const express = require('express');
const TabellaLaboratorioService = require('../../services/TabellaLaboratorioService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const dati = await TabellaLaboratorioService.getData(anno);
      return res.json(dati);
    } catch (error) {
      log.error(`Error finding data for tabella laboratorio: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const datiBudget = req.body;
      const result = await TabellaLaboratorioService.saveData(datiBudget);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella laboratorio: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
