const express = require('express');
const TabellaTeamsystemHrDipendenti = require('../../services/TabellaTeamsystemHrDipendenti');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

const AZIENDA_MAPPER = {
  UNITRAT: '0000000375',
  TEMPRASUD: '0000000102'
};
module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    let { aziendaId } = req.query;

    try {
      aziendaId = AZIENDA_MAPPER[aziendaId];
      if (aziendaId === undefined) {
        throw Error('Incoming aziendaId is not mapped ');
      }
      const dipendenti = await TabellaTeamsystemHrDipendenti.findAllByAziendaId(aziendaId);
      return res.json(dipendenti);
    } catch (error) {
      log.error(`Error finding hr dipendti teamsystem: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });
  return router;
};
