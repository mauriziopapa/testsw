/* eslint-disable camelcase */
const express = require('express');
const KpiProduzioneService = require('../../services/KpiProduzioneService');
const TabellaGestioneImpiantiINDService = require('../../services/TabellaGestioneImpiantiINDService');
const TabellaGestioneImpiantiService = require('../../services/TabellaGestioneImpiantiService');
const ImpiantiInduzioneService = require('../../services/ImpiantiInduzioneService');
const { isAuthenticated } = require('../../middlewares/authentication');
const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} entering table ${req.originalUrl}.`);
    try {
      const { anno, mese } = req.query;
      const impianti = await TabellaGestioneImpiantiINDService.getData(anno, mese, req.user);
      return res.json(impianti);
    } catch (error) {
      log.error(`Error finding data for tabella gestione impianti ind: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/', [isAuthenticated], async (req, res) => {
    log.info(`User ${req.user.username} saving table ${req.originalUrl}.`);
    try {
      const { impianti, kpi_produzione, dipendenti, anno, mese } = req.body;

      // i kpi di produzione sono divisi tra due tabelle, per questo vanno aggiornate entrambe:
      // i kpi di produzione dei reparti singoli sono su impianti_crud
      // + i kpi di produzione per i reparti che hanno le somme calcolate che sono su kpi_produzione
      const promises = [];
      promises.push(TabellaGestioneImpiantiService.saveData(impianti));
      promises.push(KpiProduzioneService.upsert(kpi_produzione));
      promises.push(ImpiantiInduzioneService.updateDipendentiCount(anno, mese, req.user, dipendenti));
      const result = await Promise.all(promises);
      return res.json(result);
    } catch (error) {
      log.error(`Error updating data for tabella gestione impianti ind: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
