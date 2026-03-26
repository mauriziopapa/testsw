const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const SezionaleOfferteTS = dbBi.sequelizeBi.define(
  'teamsystem_sezionale_offerte',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descrizione: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_sezionale_offerte'
  }
);

module.exports = SezionaleOfferteTS;
