const express = require('express');
const AzioniMiglioramentoNewService = require('../../../services/kpi/AzioniMiglioramentoNewService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, target } = req.query;
      const result = await AzioniMiglioramentoNewService.getKpiValues({ from, to, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Azioni Miglioramento New: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
