const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const OfferteTS = dbBi.sequelizeBi.define(
  'teamsystem_offerte',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IdCliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DataDocumento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    NumDocumento: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RepartoOfferta: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    Importo: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    Stato: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MotivoRinuncia: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_offerte'
  }
);

module.exports = OfferteTS;
