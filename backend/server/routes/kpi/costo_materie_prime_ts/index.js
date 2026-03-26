/* eslint-disable camelcase */
const express = require('express');
const CostoMateriePrimeTSService = require('../../../services/kpi/CostoMateriePrimeTSService');
const MateriePrimeTSService = require('../../../services/MateriePrimeTSService');
const RischioService = require('../../../services/RischioService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/debug', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, materia_prima, rischio, target, kpi_id } = req.query;
      const result = await CostoMateriePrimeTSService.getDebugData({
        from,
        to,
        materia_prima,
        rischio,
        target,
        kpi_id
      });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting debug data for kpi Costo Materie Prime Team System: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { yearFrom, yearTo, materia_prima, rischio, kpi_id } = req.query;
      const result = await CostoMateriePrimeTSService.getKpiValues({
        yearFrom,
        yearTo,
        materia_prima,
        rischio,
        kpi_id
      });
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Costo Materie Prime Team System: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/materie_prime_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MateriePrimeTSService.findAllDistinct();
      const materiePrime = result
        .filter((mp) => mp.SFamArticolo.trim() === 'PCR')
        .map((r) => ({
          id_materia_prima: r.CodArticolo.trim(),
          nome_materia_prima: r.DesArticolo.trim()
        }));

      const materiePrimeDistinct = materiePrime.filter(
        (value, index, self) => index === self.findIndex((t) => t.id_materia_prima === value.id_materia_prima)
      );

      const output = [{ id_materia_prima: '-Tutti-', nome_materia_prima: '-Tutti-' }].concat(materiePrimeDistinct);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Costo Materie Prime Team System: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/materie_prime_ts/:rischio', [isAuthenticated], async (req, res) => {
    try {
      const { rischio } = req.params;
      const result = await MateriePrimeTSService.getMateriePrimeByRischio(rischio);
      const materiePrime = result.map((r) => ({
        id_materia_prima: r.CodArticolo.trim(),
        nome_materia_prima: `(${r.CodArticolo.trim()}) ${r.DesArticolo.trim()}`
      }));
      const output = [{ id_materia_prima: '-Tutti-', nome_materia_prima: '-Tutti-' }].concat(materiePrime);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting Materie Prime Team System con livello di rischio: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/rischio_ts', [isAuthenticated], async (req, res) => {
    try {
      const output = RischioService.getRischi();
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Rischio TS: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
