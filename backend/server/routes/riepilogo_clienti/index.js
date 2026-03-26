const express = require('express');
const RiepilogoClientiService = require('../../services/RiepilogoClientiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { anno } = req.query;
      const contatori = await RiepilogoClientiService.findAllByYear(anno);
      return res.json(contatori);
    } catch (error) {
      log.error(`Error finding riepilogo clienti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
