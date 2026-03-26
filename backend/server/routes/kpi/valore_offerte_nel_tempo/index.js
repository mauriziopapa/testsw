/* eslint-disable camelcase */
const express = require('express');
const ValoreOfferteNelTempoCRMService = require('../../../services/kpi/ValoreOfferteNelTempoCRMService');
const ValoreOfferteNelTempoTSService = require('../../../services/kpi/ValoreOfferteNelTempoTSService');
const MotiviRinunciaService = require('../../../services/kpi/MotiviRinunciaService');
const { isAuthenticated } = require('../../../middlewares/authentication');
const { isBeforeYear, isBetween } = require('../../../lib/time');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      let result = [];
      const { yearFrom, yearTo, tipo_offerta, kpi_id, target } = req.query;

      // Fino al 2021 andiamo sul CRM
      // Dal 2022 su Team System
      const fromY = parseInt(yearFrom);
      const toY = parseInt(yearTo);
      if (fromY <= 2021 && toY >= 2022) {
        const toYear2021 = 2021;
        const fromYear2022 = 2022;
        const result2021 = await ValoreOfferteNelTempoCRMService.getKpiValues({
          from: yearFrom,
          to: toYear2021,
          tipo_offerta,
          kpi_id,
          target
        });
        const result2022 = await ValoreOfferteNelTempoTSService.getKpiValues({
          from: fromYear2022,
          to: yearTo,
          tipo_offerta,
          kpi_id,
          target
        });

        result = result2021.concat(result2022);
      } else if (fromY <= 2021) {
        result = await ValoreOfferteNelTempoCRMService.getKpiValues({
          from: yearFrom,
          to: yearTo,
          tipo_offerta,
          kpi_id,
          target
        });
      } else {
        result = await ValoreOfferteNelTempoTSService.getKpiValues({
          from: yearFrom,
          to: yearTo,
          tipo_offerta,
          kpi_id,
          target
        });
      }

      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Valore Offerte nel Tempo Service: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/tipi_offerte_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MotiviRinunciaService.getOfferTypes();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting parametro tipi_offerte_ts Tipi Offerte: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
