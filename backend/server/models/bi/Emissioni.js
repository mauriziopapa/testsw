const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const PuntoDiEmissione = require('./PuntoDiEmissione');
const Inquinante = require('./Inquinante');

const Emissioni = dbBi.sequelizeBi.define(
  'emissioni',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false
    },
    id_punto_di_emissione: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PuntoDiEmissione,
        key: 'id'
      }
    },
    punto_di_emissione: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rapporto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_inquinante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Inquinante,
        key: 'id'
      }
    },
    inquinante: {
      type: DataTypes.STRING,
      allowNull: true
    },
    c_rilevata: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    limiti_di_legge: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valore_percentuale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limite_al_100: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limite_al_70: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limite_al_50: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limite_al_20: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    media_tutte_emissioni: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    etichetta_estesa: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'emissioni'
  }
);

module.exports = Emissioni;
