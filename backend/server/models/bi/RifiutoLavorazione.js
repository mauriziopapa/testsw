const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const RifiutoLavorazione = dbBi.sequelizeBi.define(
  'rifiuti_lavorazioni',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_lavorazione: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cod_trattamento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gruppo_lavorazione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gruppo_lavorazione_descrizione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_reparto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reparto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_rifiuto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nome_rifiuto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'rifiuti_lavorazioni'
  }
);

module.exports = RifiutoLavorazione;
