const express = require('express');
const InquinantiService = require('../../services/InquinantiService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const inquinanti = await InquinantiService.findAll();
      return res.json(inquinanti);
    } catch (error) {
      log.error(`Error finding inquinanti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const inquinante = await InquinantiService.findOneById(req.params.id);
      return res.json(inquinante);
    } catch (error) {
      log.error(`Error finding inquinanti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
