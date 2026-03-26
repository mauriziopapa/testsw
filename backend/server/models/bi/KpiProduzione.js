const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const KpiProduzione = dbBi.sequelizeBi.define(
  'kpi_produzione',
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
    reparto: {
      type: DataTypes.STRING,
      allowNull: true
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
      allowNull: true
    }
  },
  {
    tableName: 'kpi_produzione'
  }
);

module.exports = KpiProduzione;
