/* eslint-disable camelcase */
/* eslint-disable implicit-arrow-linebreak */
const express = require('express');
const RipartizioneOreManutenzioneService = require('../../../services/kpi/RipartizioneOreManutenzioneService');
const { isAuthenticated } = require('../../../middlewares/authentication');

const config = require('../../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      const { year, target, kpi_id } = req.query;
      const filters = {
        year,
        target,
        kpi_id
      };
      const result = await RipartizioneOreManutenzioneService.getKpiValues(filters);
      const reparti = ['LLF', 'NCV', 'NCV Cieffe', 'NCV Ipsen', 'VUOTO', 'TV', 'ALU', 'IND'];
      const grouped = convertDataGroupedByReparto(reparti, result);
      const output = grouped.filter((group) => !group.valori.includes(undefined));
      // Aggiungo il target
      const targetValue = result && result.length > 0 ? result[0].target : null;
      output.forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.target = targetValue;
      });
      return res.json(output);
    } catch (error) {
      log.error(`Error getting kpi Ripartizione Ore Manutenzione: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};

const convertDataGroupedByReparto = (reparti, results) =>
  // Converto la struttura dati in base al reparto
  // per tutti gli anni
  // Serve per mostrare il kpi per reparto con i dati per ogni anno affiancati
  reparti.flatMap((reparto) =>
    results
      .map((r) => {
        const value = r.valori.filter((v) => v.label === reparto)[0];
        if (value) {
          value.label = r.label;
          value.target = r.target;
          return value;
        }
      })
      .map((datiReparto) => ({ label: reparto, valori: datiReparto }))
      .reduce(
        (a, b) => {
          a.label = b.label;
          a.valori.push(b.valori);
          return a;
        },
        { label: '', valori: [] }
      )
  );
