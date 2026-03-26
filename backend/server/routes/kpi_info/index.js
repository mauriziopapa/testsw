const express = require('express');
const KpiInfoService = require('../../services/KpiInfoService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/:id', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} is opening kpi info for kpi=${req.params.id}.`);
    try {
      const info = await KpiInfoService.getKpiInfo(req.params.id);
      return res.json(info);
    } catch (error) {
      log.error(`Error finding kpi info: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
