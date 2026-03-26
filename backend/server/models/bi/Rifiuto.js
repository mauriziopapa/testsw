const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Rifiuto = dbBi.sequelizeBi.define(
  'rifiuti',
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
    udm: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'rifiuti'
  }
);

module.exports = Rifiuto;
