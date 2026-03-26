const express = require('express');
const TabellaCommesseNcService = require('../../services/TabellaCommesseNcService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    const { anno } = req.query;

    try {
      const commesse = await TabellaCommesseNcService.findAllByYear(anno);
      return res.json(commesse);
    } catch (error) {
      log.error(`Error finding commesse nc: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
