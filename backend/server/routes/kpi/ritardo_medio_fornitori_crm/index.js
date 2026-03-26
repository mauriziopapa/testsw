/* eslint-disable camelcase */
const express = require('express');
const RitardoMedioFornitoriCRMService = require('../../../services/kpi/RitardoMedioFornitoriCRMService');
const FornitoriCRMService = require('../../../services/FornitoriCRMService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, fornitore } = req.query;
      const result = await RitardoMedioFornitoriCRMService.getKpiValues({ from, to, fornitore });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Ritardo Medio Fornitori CRM: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/fornitori_con_ordini_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await FornitoriCRMService.findAll();
      const output = result.map((r) => ({ id_fornitore: r.CodiceFornitore, nome_fornitore: r.RagioneSociale }));
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Fornitori CRM: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
