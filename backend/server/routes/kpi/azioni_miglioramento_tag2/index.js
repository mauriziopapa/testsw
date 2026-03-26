/* eslint-disable camelcase */
const express = require('express');
const AzioniMiglioramentoTagService2 = require('../../../services/kpi/AzioniMiglioramentoTag2Service');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year, tipologia, target, kpi_id } = req.query;
      const result = await AzioniMiglioramentoTagService2.getKpiValues({ year, tipologia, target, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Azioni Miglioramento Tag 2: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
