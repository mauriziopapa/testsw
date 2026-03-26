const express = require('express');
const ContatoriMetanoService = require('../../services/ContatoriMetanoService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const contatori = await ContatoriMetanoService.findAll();
      const output = contatori.map((c) => ({
        id: c.id,
        nome: `${c.codice} - ${c.nome}`
      }));
      return res.json(output);
    } catch (error) {
      log.error(`Error finding contatori: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/lavorazioni/', [isAuthenticated], async (req, res) => {
    try {
      const contatori = await ContatoriMetanoService.findAllContatoriLavorazioni();
      return res.json(contatori);
    } catch (error) {
      log.error(`Error finding contatori e lavorazioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    try {
      const { contatori } = req.body;
      const roles = await ContatoriMetanoService.upsert(contatori);
      return res.json(roles);
    } catch (error) {
      log.error(`Error updating contatori: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const contatore = await ContatoriMetanoService.findOneById(req.params.id);
      return res.json(contatore);
    } catch (error) {
      log.error(`Error finding contatore: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
