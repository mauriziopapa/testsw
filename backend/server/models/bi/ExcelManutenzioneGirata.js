const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ExcelManutenzioneGirata = dbBi.sequelizeBi.define(
  'excel_manutenzione_girata',
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
    impianto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipologia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    foglio: {
      type: DataTypes.STRING,
      allowNull: true
    },
    val: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'excel_manutenzione_girata'
  }
);

module.exports = ExcelManutenzioneGirata;
