/* eslint-disable camelcase */
const express = require('express');
const CostoMedioMateriePrimeCRMService = require('../../../services/kpi/CostoMedioMateriePrimeCRMService');
const MateriePrimeCRMService = require('../../../services/MateriePrimeCRMService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, materia_prima, kpi_id } = req.query;
      const result = await CostoMedioMateriePrimeCRMService.getKpiValues({ yearFrom, yearTo, materia_prima, kpi_id });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Costo Materie Prime CRM: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/materie_prime_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MateriePrimeCRMService.findAll();
      const output = result.map((r) => ({ id_materia_prima: r.CodArticolo, nome_materia_prima: r.DesArticolo }));
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Costo Materie Prime CRM: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
