/* eslint-disable camelcase */
const express = require('express');
const EfficaciaCommercialeService = require('../../../services/kpi/EfficaciaCommercialeService');
const EfficaciaCommercialeTSService = require('../../../services/kpi/EfficaciaCommercialeTSService');
const MotiviRinunciaService = require('../../../services/kpi/MotiviRinunciaService');
const { isAuthenticated } = require('../../../middlewares/authentication');
const { isBeforeYear, isBetween } = require('../../../lib/time');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/:area', [isAuthenticated], async (req, res) => {
    let result = [];
    const { from, to, tipo_offerta, kpi_id, target } = req.query;
    const { area } = req.params;
    try {
      if (isBetween(from, to, '2022')) {
        const toYear2021 = '2021-12';
        const fromYear2022 = '2022-01';
        const result2021 = await EfficaciaCommercialeService.getKpiAreaValues({
          from,
          to: toYear2021,
          tipo_offerta,
          area,
          kpi_id,
          target
        });
        const result2022 = await EfficaciaCommercialeTSService.getKpiAreaValues({
          from: fromYear2022,
          to,
          tipo_offerta,
          area,
          kpi_id,
          target
        });
        const data2021 = result2021[0].data;
        const data2022 = result2022[0].data;
        const data = data2021.concat(data2022);
        const nc_tot = result2021[0].nc_tot + result2022[0].nc_tot;
        result.push({ data, nc_tot });
      } else if (isBeforeYear(from, '2022')) {
        result = await EfficaciaCommercialeService.getKpiAreaValues({
          from,
          to,
          tipo_offerta,
          area,
          kpi_id,
          target
        });
      } else {
        result = await EfficaciaCommercialeTSService.getKpiAreaValues({
          from,
          to,
          tipo_offerta,
          area,
          kpi_id,
          target
        });
      }

      return res.json(result);
    } catch (error) {
      log.error(
        `Error getting kpi Efficacia Commerciale for area=${area} and tipo_offerta=${tipo_offerta}: ${error.message}`
      );
      return res.sendStatus(500);
    }
  });

  router.get('/:area/tipi_offerte_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await MotiviRinunciaService.getOfferTypesTeamSystem();
      const tipi_offerte = result.map((r) => ({ tipo: r.codice, tipo_offerta: r.descrizione }));
      const output = [{ tipo: '-Tutti-', tipo_offerta: '-Tutti-' }].concat(tipi_offerte);
      return res.json(output);
    } catch (error) {
      log.error(`Error getting parametro tipi_offerte_ts Tipi Offerte: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
