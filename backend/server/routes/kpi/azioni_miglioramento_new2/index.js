/* eslint-disable camelcase */
const express = require('express');
const AzioniMiglioramentoNewService2 = require('../../../services/kpi/AzioniMiglioramentoNew2Service');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year, kpi_id, target } = req.query;
      const result = await AzioniMiglioramentoNewService2.getKpiValues({ year, kpi_id, target });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Azioni Miglioramento New 2: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
