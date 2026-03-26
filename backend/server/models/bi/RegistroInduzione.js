const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const RegistroInduzione = dbBi.sequelizeBi.define(
  'registro_induzione',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    IDInduzione: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroCommessa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CodiceCliente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDProdotto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CodiceProdotto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDOperatore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    GiornoLavorazione: {
      type: DataTypes.DATE,
      allowNull: true
    },
    OreTotaliLavorate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PezziLavorati: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PezziScarto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PezziControllo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoSetup: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoMessaAPunto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoGuasto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoCostruzioneInduttore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoRitardoLaboratorio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoAssenzaEnergia: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoManutenzioneOrdinaria: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoFormazione: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoAltreAttivita: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoPulizia: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoProtezioni: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TempoControlliCricche: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prezzo: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    GiornoCompilazione: {
      type: DataTypes.DATE,
      allowNull: true
    },
    conversione_effettuata: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'registro_induzione',
    timestamps: false
  }
);

module.exports = RegistroInduzione;
