const express = require('express');
const TabellaZohoTasksService = require('../../services/TabellaZohoTasksService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    const { anno } = req.query;

    try {
      const tasks = await TabellaZohoTasksService.findAllByYear(anno);
      return res.json(tasks);
    } catch (error) {
      log.error(`Error finding teamsystem orders: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
