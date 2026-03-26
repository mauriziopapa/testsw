const express = require('express');
const RoleService = require('../../services/RoleService');
const { isAuthenticated } = require('../../middlewares/authentication');
const { isAuthorized } = require('../../middlewares/authorization');
const { READ } = require('../../lib/actions');

const MODULE = 'Roles';

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated, isAuthorized(MODULE, READ)], async (req, res) => {
    try {
      const roles = await RoleService.findAll();
      return res.json(roles);
    } catch (error) {
      log.error(`Error finding roles: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated, isAuthorized(MODULE, READ)], async (req, res) => {
    try {
      const role = await RoleService.findOneById(req.params.id);
      return res.json(role);
    } catch (error) {
      log.error(`Error finding role: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
