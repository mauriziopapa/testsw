const express = require('express');
const MateriePrimeService = require('../../services/MateriePrimeService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const materieprime = await MateriePrimeService.findAllMappingMateriePrime();
      const response = materieprime.map((mp) => ({
        id: mp.id,
        materia_prima: mp.materie_primes[0].nome,
        materia_prima_id: mp.materie_primes[0].id,
        materia_prima_ts: mp.teamsystem_materieprimes[0].DesArticolo,
        materia_prima_ts_cod: mp.teamsystem_materieprimes[0].CodArticolo.trim(),
        fornitore_materia_prima_ts_cod: mp.teamsystem_materieprimes[0].CodFornitore,
        materia_prima_ts_id: mp.teamsystem_materieprimes[0].id,
        data: mp.data
      }));
      return res.json(response);
    } catch (error) {
      log.error(`Error finding materieprime for tabella mapping: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const mp = req.body;
      const result = await MateriePrimeService.update(mp);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating mapping materie prime: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.delete('/:id', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} is deleting values from ${req.originalUrl} with id=${req.params.id}.`);
    try {
      const mp = await MateriePrimeService.deleteMapping(req.params.id);
      return res.json(mp);
    } catch (error) {
      log.error(`Error deleting values materie prime: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
