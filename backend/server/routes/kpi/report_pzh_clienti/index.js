/* eslint-disable max-len */
const express = require('express');
const moment = require('moment');
const { FORMAT_DATE } = require('../../../lib/time');
const ReportPzhClientiByCommessaService = require('../../../services/kpi/ReportPzhClientiByCommessaService');
const ReportPzhClientiByProductService = require('../../../services/kpi/ReportPzhClientiByProductService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/commessa', [isAuthenticated], async (req, res) => {
    log.info(
      `User ${req.user.username} requesting report pzh clienti by commessa with useragent ${req.get('user-agent')}.`
    );
    try {
      const wb = await ReportPzhClientiByCommessaService.getReport();
      const time = moment().format(FORMAT_DATE);
      return wb.write(`ReportPzhClientiPerComm_${time}.xlsx`, res);
    } catch (error) {
      log.error(`Error getting kpi Report pzh Clienti: ${error.message}`, error);
      return res.status(500).json({
        message: `Si è verificato un errore, per favore inviare uno screenshot di questo errore all'indirizzo assistenza@studioware.eu ${error.stack}`
      });
    }
  });

  router.get('/product', [isAuthenticated], async (req, res) => {
    log.info(
      `User ${req.user.username} requesting report pzh clienti by product with useragent ${req.get('user-agent')}.`
    );
    try {
      const wb = await ReportPzhClientiByProductService.getReport();
      const time = moment().format(FORMAT_DATE);
      return wb.write(`ReportPzhClientiPerProd_${time}.xlsx`, res);
    } catch (error) {
      log.error(`Error getting kpi Report pzh Clienti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
