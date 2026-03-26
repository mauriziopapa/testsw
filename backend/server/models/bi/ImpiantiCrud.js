const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ImpiantiCrud = dbBi.sequelizeBi.define(
  'impianti_crud',
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
    fk_impianto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fk_kpi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valore: {
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
    tableName: 'impianti_crud'
  }
);

module.exports = ImpiantiCrud;
