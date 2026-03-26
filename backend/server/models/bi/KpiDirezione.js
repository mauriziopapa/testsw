const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const KpiDirezione = dbBi.sequelizeBi.define(
  'kpi_direzione',
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
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kpi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    val: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  },
  {
    tableName: 'kpi_direzione'
  }
);

module.exports = KpiDirezione;
