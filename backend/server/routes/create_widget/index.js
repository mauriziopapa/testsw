const express = require('express');
const WidgetService = require('../../services/WidgetService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.put('/:url', [isAuthenticated], async (req, res) => {
    try {
      const widget = req.body;
      const { url } = req.params;
      let updated;
      if (widget.id_user) {
        updated = await WidgetService.createWidgetInstanceForUser(url, widget);
      } else {
        updated = await WidgetService.createWidgetInstance(url, widget);
      }
      return res.json(updated);
    } catch (error) {
      log.error(`Error creating widget: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
