const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const PuntoDiEmissione = dbBi.sequelizeBi.define(
  'punti_emissione',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    udm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'punti_emissione'
  }
);

module.exports = PuntoDiEmissione;
