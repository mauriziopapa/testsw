const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const OrdineMateriaPrimaMensileTS = dbBi.sequelizeBi.define(
  'teamsystem_ordini_materieprime_mensile',
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
    quantita: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costo_totale: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    codice_articolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descr_articolo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    extracosti: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    famiglia_mp: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_ordini_materieprime_mensile'
  }
);

module.exports = OrdineMateriaPrimaMensileTS;
