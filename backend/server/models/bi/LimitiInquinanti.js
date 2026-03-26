const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const PuntoDiEmissione = require('./PuntoDiEmissione');
const Inquinante = require('./Inquinante');

const LimitiInquinanti = dbBi.sequelizeBi.define(
  'limiti_inquinanti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    punto_di_emissione: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PuntoDiEmissione,
        key: 'id'
      }
    },
    inquinante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Inquinante,
        key: 'id'
      }
    },
    limite: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: 'limiti_inquinanti'
  }
);

module.exports = LimitiInquinanti;
