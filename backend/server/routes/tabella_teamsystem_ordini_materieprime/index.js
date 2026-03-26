const express = require('express');
const TabellaTeamSystemOrdiniMateriePrimeService = require('../../services/TabellaTeamsystemOrdiniMateriePrimeService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    const { anno } = req.query;

    try {
      const orderedMaterials = await TabellaTeamSystemOrdiniMateriePrimeService.findAllByYear(anno);
      return res.json(orderedMaterials);
    } catch (error) {
      log.error(`Error finding teamsystem ordered materialias: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
