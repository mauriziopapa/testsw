/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const express = require('express');
const UserDashboard = require('../../models/sapere/UserDashboard');
const WidgetInstance = require('../../models/sapere/WidgetInstance');
const FilterValue = require('../../models/sapere/FilterValue');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.put('/:userId/:dashboardId', [isAuthenticated], async (req, res) => {
    try {
      const { userId, dashboardId } = req.params;

      // eslint-disable-next-line camelcase
      const user_dashboard = { iduser: userId, iddashboard: dashboardId, visible: 1, order: 6, columns: 3 };
      const createdDashboard = await UserDashboard.create(user_dashboard);
      log.info(`Dashboard ${dashboardId} created for user ${userId}`);

      const templateDashboard = await UserDashboard.findAll({ where: { iduser: 19, iddashboard: dashboardId } });
      const templateDashboardId = templateDashboard[0].iduser_dashboard;

      const widgets = await WidgetInstance.findAll({ where: { user_dashboard: templateDashboardId } });

      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];

        const widgetFilters = await FilterValue.findAll({ where: { idwidget_instance: widget.idwidget_instance } });

        const new_widget = {
          idwidget: widget.idwidget,
          position: widget.position,
          user_dashboard: createdDashboard.iduser_dashboard,
          visible: widget.visible
        };

        const created = await WidgetInstance.create(new_widget);
        log.info(`WidgetInstance created for user ${userId} and dashboard ${dashboardId}`, created);

        for (let j = 0; j < widgetFilters.length; j++) {
          const filter = widgetFilters[j];

          const new_filter = {
            idfilter: filter.idfilter,
            default_value: filter.default_value,
            idwidget_instance: created.idwidget_instance
          };

          const createdFilter = await FilterValue.create(new_filter);
          log.info(`FilterValue created for user ${userId} and dashboard ${dashboardId}`, createdFilter);
        }
      }

      return res.json({ message: 'ok' });
    } catch (error) {
      log.error(`Error assigning dashboard: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
