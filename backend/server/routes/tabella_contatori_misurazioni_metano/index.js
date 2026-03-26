const express = require('express');
const TabellaContatoriMisurazioniMetanoService = require('../../services/TabellaContatoriMisurazioniMetanoService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const contatoriMisurazioniMetano = await TabellaContatoriMisurazioniMetanoService.getData(anno);
      return res.json(contatoriMisurazioniMetano);
    } catch (error) {
      log.error(`Error finding data for tabella contatori misurazioni metano: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const contatori = req.body;
      const result = await TabellaContatoriMisurazioniMetanoService.saveData(contatori);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella contatori misurazioni metano: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.delete('/:id', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} is deleting values from ${req.originalUrl} with id=${req.params.id}.`);
    try {
      const rifiuto = await TabellaContatoriMisurazioniMetanoService.deleteData(req.params.id);
      return res.json(rifiuto);
    } catch (error) {
      log.error(`Error deleting data for tabella contatori misurazioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
