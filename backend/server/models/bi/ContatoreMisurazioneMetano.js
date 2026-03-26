const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const ContatoreMetano = require('./ContatoreMetano');

const ContatoreMisurazioneMetano = dbBi.sequelizeBi.define(
  'contatori_misurazioni_metano',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_contatore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ContatoreMetano,
        key: 'id'
      }
    },
    nome_contatore: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: true
    },
    misurazione: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  },
  {
    tableName: 'contatori_misurazioni_metano'
  }
);

module.exports = ContatoreMisurazioneMetano;
