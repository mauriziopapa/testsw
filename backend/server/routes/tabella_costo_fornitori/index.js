const express = require('express');
const FornitoriTSService = require('../../services/FornitoriTSService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const fornitori = await FornitoriTSService.getAllFornitoriByCosto();
      return res.json(fornitori);
    } catch (error) {
      log.error(`Error finding data for tabella costo fornitori: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
