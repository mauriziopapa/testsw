const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const KpiPersonale = dbBi.sequelizeBi.define(
  'kpi_personale',
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
    },
    val_12m: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    forzatura_manuale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'kpi_personale'
  }
);

module.exports = KpiPersonale;
