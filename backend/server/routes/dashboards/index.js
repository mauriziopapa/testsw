const express = require('express');
const DashboardService = require('../../services/DashboardService');
const UserDashboardService = require('../../services/UserDashboardService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const dashboards = await DashboardService.findAll();
      return res.json(dashboards);
    } catch (error) {
      log.error(`Error finding dashboards: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:id', [isAuthenticated], async (req, res) => {
    try {
      const dashboard = await DashboardService.findOneById(req.params.id);
      return res.json(dashboard);
    } catch (error) {
      log.error(`Error finding dashboard: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.put('/:id', [isAuthenticated], async (req, res) => {
    try {
      const dashboard = req.body;
      const updated = await DashboardService.updateDashboard(dashboard);
      return res.json(updated);
    } catch (error) {
      log.error(`Error updating dashboard: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.patch('/:id/columns', [isAuthenticated], async (req, res) => {
    try {
      const { columns } = req.body;
      const dashboard = req.params.id;
      const updated = await UserDashboardService.updateColumns(dashboard, columns);
      return res.json(updated);
    } catch (error) {
      log.error(`Error updating dashboard columns: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:url/widgets', [isAuthenticated], async (req, res) => {
    try {
      log.info(
        `User ${req.user.username} entering dashboard ${req.params.url} with useragent ${req.get('user-agent')}.`
      );
      const widgets = await DashboardService.getDashboardWidgets(req.params.url, req.user.id);
      return res.json(widgets);
    } catch (error) {
      log.error(`Error getting dashboard widgets: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.put('/:url/widgets', [isAuthenticated], async (req, res) => {
    try {
      log.info(`User ${req.user.username} updating widget order for dashboard ${req.params.url}.`);
      const widgets = req.body;
      const widgetsInstances = widgets.map((wi) => ({ id: wi.idwidget_instance, position: wi.position }));
      const promises = widgetsInstances.map((wi) => DashboardService.updateWidgetOrder(wi));
      const results = await Promise.all(promises);
      return res.json(results);
    } catch (error) {
      log.error(`Error updating widget order: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
