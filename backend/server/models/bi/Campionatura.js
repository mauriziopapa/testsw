const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Campionatura = dbBi.sequelizeBi.define(
  'campionature',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    anno_campionatura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nr_campionatura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_commessa: {
      type: DataTypes.STRING,
      allowNull: false
    },
    riferimento_apqp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_motivo_campionatura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    esito: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ricezione_PSW_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PSW_ricevuto_il: {
      type: DataTypes.DATE,
      allowNull: false
    },
    costo_campionatura: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    protocollo_campionatura: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_collegato: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    settore_applicativo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lead_time: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data_ricezione_materiale: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'campionature'
  }
);

module.exports = Campionatura;
