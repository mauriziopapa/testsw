const express = require('express');
const { isNotNumber } = require('../../lib/utils');
const EmissioniService = require('../../services/EmissioniService');
const { isAuthenticated } = require('../../middlewares/authentication');
const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno, mese } = req.query;
      if (anno == null || mese == null || isNotNumber(anno) || isNotNumber(mese) || anno < 2008 || mese > 13) {
        return res.sendStatus(400);
      }
      const emissioni = await EmissioniService.findAll(anno, mese);
      return res.json(emissioni);
    } catch (error) {
      log.error(`Error finding emissioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const emissioni = req.body;
      const result = await EmissioniService.update(emissioni);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating emissioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const emissione = await EmissioniService.findOneById(req.params.id);
      return res.json(emissione);
    } catch (error) {
      log.error(`Error finding emissione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.delete('/:id', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} is deleting values from ${req.originalUrl} with id=${req.params.id}.`);
    try {
      const emissione = await EmissioniService.deleteData(req.params.id);
      return res.json(emissione);
    } catch (error) {
      log.error(`Error deleting values for emissioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
