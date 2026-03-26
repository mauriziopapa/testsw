const express = require('express');
const PuntiDiEmissioneService = require('../../services/PuntiDiEmissioneService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const contatori = await PuntiDiEmissioneService.findAll();
      return res.json(contatori);
    } catch (error) {
      log.error(`Error finding punti di emissione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const contatore = await PuntiDiEmissioneService.findOneById(req.params.id);
      return res.json(contatore);
    } catch (error) {
      log.error(`Error finding punto di emissione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
