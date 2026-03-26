/* eslint-disable camelcase */
const express = require('express');
const D8TempoChiusuraExcelService = require('../../../services/kpi/D8TempoChiusuraExcelService');
const D8TempoChiusuraService = require('../../../services/kpi/D8TempoChiusuraService');
const { isAuthenticated } = require('../../../middlewares/authentication');
const { isBeforeYear, isBetween } = require('../../../lib/time');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      let result = [];
      const { from, to, tipologia, kpi_id, target } = req.query;
      if (isBetween(from, to, '2022')) {
        const toYear2021 = '2021-12';
        const fromYear2022 = '2022-01';
        const result2021 = await D8TempoChiusuraExcelService.getKpiValues({
          from,
          to: toYear2021,
          tipologia,
          kpi_id,
          target
        });
        const result2022 = await D8TempoChiusuraService.getKpiValues({
          from: fromYear2022,
          to,
          tipologia,
          kpi_id,
          target
        });
        const data2021 = result2021[0].data;
        const data2022 = result2022[0].data;
        const data = data2021.concat(data2022);
        const nc_tot = result2021[0].nc_tot + result2022[0].nc_tot;
        result.push({ data, nc_tot });
      } else if (isBeforeYear(from, '2022')) {
        result = await D8TempoChiusuraExcelService.getKpiValues({ from, to, tipologia, kpi_id, target });
      } else {
        result = await D8TempoChiusuraService.getKpiValues({ from, to, tipologia, kpi_id, target });
      }
      return res.json(result);
    } catch (error) {
      log.error(`Error getting kpi 8d Tempo Chiusura: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
