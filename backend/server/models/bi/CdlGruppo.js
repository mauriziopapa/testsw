const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const CdlGruppo = dbBi.sequelizeBi.define(
  'cdl_gruppi',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GruppoCdL: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DescrizioneGruppoCdL: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'cdl_gruppi'
  }
);

module.exports = CdlGruppo;
