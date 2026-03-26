const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const RiepilogoClienti = dbBi.sequelizeBi.define(
  'riepilogo_clienti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    piva: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cod_anagrafica: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rag_sociale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    aumento_listino: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato_previsionale: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato_prec: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato_12m: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato_cliente: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    budget: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'riepilogo_clienti'
  }
);

module.exports = RiepilogoClienti;
