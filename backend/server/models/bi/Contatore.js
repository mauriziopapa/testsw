const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Contatore = dbBi.sequelizeBi.define(
  'contatori',
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
    tableName: 'contatori'
  }
);

module.exports = Contatore;
