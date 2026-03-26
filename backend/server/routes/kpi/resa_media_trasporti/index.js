/* eslint-disable camelcase */
const express = require('express');
const ResaMediaTrasportiExcelService = require('../../../services/kpi/ResaMediaTrasportiExcelService');
const ResaMediaTrasportiService = require('../../../services/kpi/ResaMediaTrasportiService');
const { isAuthenticated } = require('../../../middlewares/authentication');
const { isBeforeYear, isBetween } = require('../../../lib/time');

const Value = require('../../../models/response/Value');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, zona, target, kpi_id } = req.query;
      let result = [];
      if (isBetween(from, to, '2022')) {
        const toYear2021 = '2021-12';
        const fromYear2022 = '2022-01';
        const result2021 = await ResaMediaTrasportiExcelService.getKpiValues({
          from,
          to: toYear2021,
          zona,
          target,
          kpi_id
        });
        const result2022 = await ResaMediaTrasportiService.getKpiValues({
          from: fromYear2022,
          to,
          zona,
          target,
          kpi_id
        });
        // Dal 2022 tra le zone non c'è più ABRUZZO ma l'array va riempito per il frontend
        const missingZone = result2021.zone.filter((z) => !result2022.zone.includes(z));
        missingZone.forEach((zone) => {
          result2022.data.forEach((d) => {
            const value = new Value.Builder().setLabel(zone).setData(0).build();
            d.valori.push(value);
          });
        });

        // Gli array devono essere ordinati per il frontend
        const result2022Sorted = sortAlphabetically(result2022.data);
        const result2021Sorted = sortAlphabetically(result2021.data);
        const data = result2021Sorted.concat(result2022Sorted);

        const zone = [...new Set(result2021.zone.concat(result2022.zone))];
        result = { data, zone };
      } else if (isBeforeYear(from, '2022')) {
        result = await ResaMediaTrasportiExcelService.getKpiValues({ from, to, zona, target, kpi_id });
      } else {
        result = await ResaMediaTrasportiService.getKpiValues({ from, to, zona, target, kpi_id });
      }
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Resa Media Trasporti: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/zone_trasporti_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await ResaMediaTrasportiService.getZonesForFilter();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi Resa Media Trasporti zone: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};

function sortAlphabetically(data) {
  data.forEach((d) => d.valori.sort((a, b) => a.label.localeCompare(b.label)));
  return data;
}
