const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const FornitoreTS = require('./FornitoreTS');

const OrdineTS = dbBi.sequelizeBi.define(
  'teamsystem_ordini',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IdFornitore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: FornitoreTS,
        key: 'id'
      }
    },
    DataOrdine: {
      type: DataTypes.DATE,
      allowNull: false
    },
    NumeroOrdine: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    SezOrdine: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DataEvasione: {
      type: DataTypes.DATE,
      allowNull: false
    },
    DataPrevConsegna: {
      type: DataTypes.DATE,
      allowNull: false
    },
    PrezzoProdotto: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    QuantitaOrdinata: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    CodiceArticolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DescrArticolo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    QuantitaConsegnata: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    Extracosti: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Documento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    StatoOrdine: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_ordini'
  }
);

module.exports = OrdineTS;
