const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const MovimentiCommessa = dbBi.sequelizeBi.define(
  'movimenti_commessa',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    IDMovCommessa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    GiornoConsuntivo: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    OraEntrata: {
      type: DataTypes.DATE,
      allowNull: true
    },
    GiornoConsuntivoFine: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    OraUscita: {
      type: DataTypes.DATE,
      allowNull: true
    },
    TempoConsuntivo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    minuti_consuntivo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conversione_effettuata: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    NumeroCommessa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    SottoCommessa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDLavorazione: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDOperatore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumAccontoCommessa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Peso: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    Pezzi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Saldo: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    IDCausale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroCarica: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDMovCarica: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Sequenza: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PesoLordo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Messung1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Rilavorazione: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    Impianto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Programma: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDCollaudo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDAllegato: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AnnoNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TipoNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AzioneNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AttivitaNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CausaNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'movimenti_commessa',
    timestamps: false
  }
);

module.exports = MovimentiCommessa;
