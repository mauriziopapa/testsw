const express = require('express');
const ClientiService = require('../../services/ClientiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const clienti = await ClientiService.getClienti(anno);
      // elimino la voce -Tutti-
      const output = clienti.slice(1, clienti.length);
      return res.json(output);
    } catch (error) {
      log.error(`Error finding data for tabella fatturato clienti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
