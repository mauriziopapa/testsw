const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const MateriaPrima = dbBi.sequelizeBi.define(
  'materie_prime',
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
    tableName: 'materie_prime'
  }
);

module.exports = MateriaPrima;
