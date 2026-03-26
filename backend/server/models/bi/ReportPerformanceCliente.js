const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ReportPerformanceCliente = dbBi.sequelizeBi.define(
  'report_performance_clienti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cod_anagrafica: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rag_sociale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fatturato: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fatturato_prec: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    variazione_perc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lt_medio: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ritardo_perc: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    reclami: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ppm_scarti: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: 'report_performance_clienti'
  }
);

module.exports = ReportPerformanceCliente;
