const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Concorrente = dbBi.sequelizeBi.define(
  'concorrenti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ros: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    ROD: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    fk_azienda: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cod_azienda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nome_azienda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fatturato: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    utile: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    patrimonio: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costi_produzione: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    oneri_finanziari: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    tax: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    imposte: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costi_per_servizi: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costo_manodopera_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costo_materie_prime_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    costi_per_servizi_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    debiti_totali: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    totale_passivita: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    tasse: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    indebitamento_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    ebtda_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    roi_perc: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'concorrenti'
  }
);

module.exports = Concorrente;
