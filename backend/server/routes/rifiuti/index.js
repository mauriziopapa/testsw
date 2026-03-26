const express = require('express');
const RifiutiService = require('../../services/RifiutiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const rifiuti = await RifiutiService.findAll();
      return res.json(rifiuti);
    } catch (error) {
      log.error(`Error finding rifiuti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/lavorazioni/', [isAuthenticated], async (req, res) => {
    try {
      const rifiuti = await RifiutiService.findAllRifiutiLavorazioni();
      return res.json(rifiuti);
    } catch (error) {
      log.error(`Error finding rifiuti e lavorazioni: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    try {
      const { rifiuti } = req.body;
      const roles = await RifiutiService.upsert(rifiuti);
      return res.json(roles);
    } catch (error) {
      log.error(`Error updating rifiuti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const rifiuto = await RifiutiService.findOneById(req.params.id);
      return res.json(rifiuto);
    } catch (error) {
      log.error(`Error finding rifiuto: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
