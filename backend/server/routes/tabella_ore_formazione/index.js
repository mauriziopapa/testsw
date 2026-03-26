const express = require('express');
const OreFormazioneService = require('../../services/OreFormazioneService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req,res) => {
    try {
      const ore = await OreFormazioneService.findAll();
      return res.json(ore);
    } catch (error) {
      log.error(`Error finding ore formazione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};