const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const LavorazioneGruppo = dbBi.sequelizeBi.define(
  'lavorazioni_gruppi',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GruppoLav: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DescrizioneGruppoLav: {
      type: DataTypes.STRING,
      allowNull: false
    },
    macroarea: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'lavorazioni_gruppi'
  }
);

module.exports = LavorazioneGruppo;
