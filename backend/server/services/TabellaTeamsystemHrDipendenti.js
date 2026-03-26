const sequelize = require('sequelize');

const TeamsystemHrDipendenti = require('../models/bi/TeamsystemHrDipendenti');

module.exports.findAllByAziendaId = async (aziendaId) => {
  return TeamsystemHrDipendenti.findAll({
    where: {
      azienda: aziendaId
    }
  });
};
