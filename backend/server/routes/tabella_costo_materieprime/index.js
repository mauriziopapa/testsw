const express = require('express');
const TabellaCostoMateriePrimeService = require('../../services/TabellaCostoMateriePrimeService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno } = req.query;
      const costiMateriePrime = await TabellaCostoMateriePrimeService.getData(anno);
      const output = costiMateriePrime.map((cmp) => ({
        id: cmp.id,
        anno: cmp.anno,
        codice: cmp.codice_articolo ? cmp.codice_articolo.trim() : '',
        descrizione: cmp.descr_articolo ? cmp.descr_articolo.trim() : '',
        costo_totale: cmp.costo_totale.toFixed(2),
        quantita_totale: cmp.quantita.toFixed(2),
        prezzo_unitario: cmp.costo_unitario.toFixed(2),
        variazione_anno_precedente: cmp.variaz_perc_anno_prec.toFixed(2)
      }));
      return res.json(output);
    } catch (error) {
      log.error(`Error finding data for tabella costo materie prime: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const costi = req.body;
      const result = await TabellaCostoMateriePrimeService.saveData(costi);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella costo materie prime: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
