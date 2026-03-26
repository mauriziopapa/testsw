const express = require('express');
const FilterService = require('../../services/FilterService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const filters = await FilterService.getFiltersValues(req.params.id);
      return res.json(filters);
    } catch (error) {
      log.error(`Error finding filters: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/:id', [isAuthenticated], async (req, res) => {
    try {
      const filterValues = req.body;
      const filters = await FilterService.saveFiltersValues(req.params.id, filterValues);
      return res.json(filters);
    } catch (error) {
      log.error(`Error updating filters: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/global/:id', [isAuthenticated], async (req, res) => {
    try {
      const filters = await FilterService.getGlobalFilters(req.params.id);
      return res.json(filters);
    } catch (error) {
      log.error(`Error finding global filters: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/global/values/:name', [isAuthenticated], async (req, res) => {
    try {
      const values = await FilterService.getGlobalFiltersValues(req.params.name);
      return res.json(values);
    } catch (error) {
      log.error(`Error finding global filters values: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
