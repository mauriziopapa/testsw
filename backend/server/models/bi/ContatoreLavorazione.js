const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ContatoreLavorazione = dbBi.sequelizeBi.define(
  'contatori_lavorazioni',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_lavorazione: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cod_trattamento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gruppo_lavorazione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gruppo_lavorazione_descrizione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_reparto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reparto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_contatore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nome_contatore: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'contatori_lavorazioni'
  }
);

module.exports = ContatoreLavorazione;
