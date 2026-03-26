const express = require('express');
const TargetService = require('../../services/TargetService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const targets = await TargetService.findAll();
      return res.json(targets);
    } catch (error) {
      log.error(`Error finding targets: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    try {
      const target = req.body;
      const targets = await TargetService.upsert(target);
      return res.json(targets);
    } catch (error) {
      log.error(`Error updating target: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:widget/:anno', [isAuthenticated], async (req, res) => {
    try {
      const { widget, anno } = req.params;
      const target = await TargetService.findOne(parseInt(widget), parseInt(anno));
      return res.json(target);
    } catch (error) {
      log.error(`Error finding target: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
