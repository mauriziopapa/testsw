const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const KpiManutenzione = dbBi.sequelizeBi.define(
  'kpi_manutenzione',
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
    tableName: 'kpi_manutenzione'
  }
);

module.exports = KpiManutenzione;
