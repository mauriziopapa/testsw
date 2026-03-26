const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ExcelOreCartellino = dbBi.sequelizeBi.define(
  'excel_ore_cartellino',
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
    mese: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ore: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'excel_ore_cartellino'
  }
);

module.exports = ExcelOreCartellino;
