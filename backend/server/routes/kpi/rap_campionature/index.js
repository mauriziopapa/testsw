const express = require('express');
const RapiditaCampionatureService = require('../../../services/kpi/RapiditaCampionatureService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, tipologia, target } = req.query;
      const filters = {
        from,
        to,
        tipologia,
        target
      };
      const result = await RapiditaCampionatureService.getKpiValues(filters);
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Rapidita Campionature: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
