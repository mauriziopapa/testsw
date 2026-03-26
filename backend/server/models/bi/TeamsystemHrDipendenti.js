const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const TeamsystemHrDipendenti = dbBi.sequelizeBi.define(
  'teamsystemhr_dipendenti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    matricola: {
      type: DataTypes.STRING,
      allowNull: true
    },
    azienda: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reparto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ruolo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    licenziamento: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'teamsystemhr_dipendenti'
  }
);

module.exports = TeamsystemHrDipendenti;
