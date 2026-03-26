const express = require('express');
const MateriePrimeService = require('../../services/MateriePrimeService');
const MateriePrimeServiceTS = require('../../services/MateriePrimeTSService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const materieprime = await MateriePrimeService.findAll();
      return res.json(materieprime);
    } catch (error) {
      log.error(`Error finding materieprime: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/ts/', [isAuthenticated], async (req, res) => {
    try {
      const materieprime = await MateriePrimeServiceTS.findAllDistinct();
      return res.json(materieprime);
    } catch (error) {
      log.error(`Error finding materieprime di team service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/lavorazioni/', [isAuthenticated], async (req, res) => {
    try {
      const materieprime = await MateriePrimeService.findAllMateriePrimeLavorazioni();
      return res.json(materieprime);
    } catch (error) {
      log.error(`Error finding materieprime e lavorazioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
