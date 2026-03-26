const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Inquinante = dbBi.sequelizeBi.define(
  'inquinanti',
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
    },
    limite: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: 'inquinanti'
  }
);

module.exports = Inquinante;
