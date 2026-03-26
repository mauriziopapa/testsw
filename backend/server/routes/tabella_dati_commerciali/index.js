const express = require('express');
const TabellaDatiCommercialiService = require('../../services/TabellaDatiCommercialiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const datiBudget = await TabellaDatiCommercialiService.getData(anno);
      return res.json(datiBudget);
    } catch (error) {
      log.error(`Error finding data for tabella budget: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const datiBudget = req.body;
      const result = await TabellaDatiCommercialiService.saveData(datiBudget);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella budget: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
