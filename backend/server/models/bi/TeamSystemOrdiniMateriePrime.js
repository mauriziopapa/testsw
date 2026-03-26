const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const TeamSystemOrdiniMateriePrime = dbBi.sequelizeBi.define(
  'teamsystem_ordini_materieprime',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IdFornitore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DataOrdine: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NumeroOrdine: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SezOrdine: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DataEvasione: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DataPrevConsegna: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PrezzoProdotto: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    CostoTotale: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    QuantitaOrdinata: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CodiceArticolo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DescrArticolo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    QuantitaConsegnata: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Extracosti: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    StatoOrdine: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'teamsystem_ordini_materieprime'
  }
);

module.exports = TeamSystemOrdiniMateriePrime;
