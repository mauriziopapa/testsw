const express = require('express');
const PercLeadTimeService = require('../../../services/kpi/PercLeadTimeService');
const ClientiService = require('../../../services/ClientiService');
const { isAuthenticated } = require('../../../middlewares/authentication');
const moment = require("moment")
const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

function yearBeforeData(req) {
  const { from, to, cliente, target } = req.query;
  const lastFrom = moment(from).subtract(1, 'years').format('YYYY-MM');
  const lastTo = moment(to).subtract(1, 'years').format('YYYY-MM');
  return { from: lastFrom, to: lastTo, cliente, target };
}

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { from, to, cliente, target } = req.query;
      const lastYearFilters = yearBeforeData(req);
      const resultLastYearFilter = await PercLeadTimeService.getKpiValues(lastYearFilters);
      const resultFilter = await PercLeadTimeService.getKpiValues({ from, to, cliente, target });
      const targetResult = resultFilter.data.map((value) => {
        return value.target;
      });
      const ritardoPercMedio = resultFilter.data.map((value) => {
        return resultFilter.ritardo_perc_medio;
      });
      return res.json({
        lastYearFilters: [...resultLastYearFilter.data],
        resultFilter: [...resultFilter.data],
        ritardo_perc_medio: ritardoPercMedio,
        target: targetResult
      });
    } catch (error) {
      log.error(`Error getting kpi % Lead Time: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/clienti_ts', [isAuthenticated], async (req, res) => {
    try {
      const result = await ClientiService.getClienti();
      return res.json(result);
    } catch (error) {
      log.error(`Error getting clienti for % Lead Time: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
