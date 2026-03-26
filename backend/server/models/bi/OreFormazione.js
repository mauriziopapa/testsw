const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const OreFormazione = dbBi.sequelizeBi.define(
  'excel_formazione',
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
    n_protocollo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipologia: {
      type: DataTypes.STRING,
      allowNull: false
    },
    costo: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    ore: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'excel_formazione'
  }
);

module.exports = OreFormazione;