const express = require('express');
const CostiConcorrentiService = require('../../../services/kpi/CostiConcorrentiService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, tipologia } = req.query;
      const filters = {
        yearFrom,
        yearTo,
        tipologia
      };
      const result = await CostiConcorrentiService.getKpiValues(filters);
      const concorrenti = await CostiConcorrentiService.getConcorrenti();
      const shortNomeConc = CostiConcorrentiService.cutConcorrentiName(concorrenti);
      const output = CostiConcorrentiService.convertDataGroupedByConcorrente(shortNomeConc, result);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting costi concorrenti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/stack', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, tipologia } = req.query;
      const filters = {
        yearFrom,
        yearTo,
        tipologia
      };
      const result = await CostiConcorrentiService.getKpiValues(filters);
      const concorrenti = await CostiConcorrentiService.getConcorrenti();
      const shortNomeConc = CostiConcorrentiService.cutConcorrentiName(concorrenti);
      const output = CostiConcorrentiService.convertDataGroupedByConcorrente(shortNomeConc, result);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting costi concorrenti stack: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
