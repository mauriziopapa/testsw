const express = require('express');
const TabellaAumentoMpFornitoriService = require('../../services/TabellaAumentoMpFornitoriService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const output = await TabellaAumentoMpFornitoriService.getData();
      return res.json(output);
    } catch (error) {
      log.error(`Error finding data for tabella aumento materie prime fornitori: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
