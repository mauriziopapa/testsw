const express = require('express');
const TabellaTimbrateNcService = require('../../services/TabellaTimbrateNcService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    const { anno } = req.query;

    try {
      const timbrate = await TabellaTimbrateNcService.findAllByYear(anno);
      return res.json(timbrate);
    } catch (error) {
      log.error(`Error finding timbrate nc: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
