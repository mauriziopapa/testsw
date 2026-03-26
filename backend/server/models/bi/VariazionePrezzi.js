const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const VariazionePrezzi = dbBi.sequelizeBi.define(
  'variazione_prezzi',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variazione: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'variazione_prezzi'
  }
);

module.exports = VariazionePrezzi;
