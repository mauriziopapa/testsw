const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const BolleScaricoTestate = dbBi.sequelizeBi.define(
  'bolle_scarico_testate',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    AnnoBolla: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    SerieBolla: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NumeroBolla: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DataBolla: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ClienteCodice: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClienteDescrizione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClienteIndirizzo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClienteLocalita: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClienteProvincia: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClienteCAP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PartitaIva: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DestDiversa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndirizzoDiverso: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocalitaDiversa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProvinciaDiversa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CapDiverso: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MezzoDiTrasporto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CausaleTrasporto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CausaleTrasportoDescrizione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Porto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PortoDescrizione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Vettore: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VettoreRagSoc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VettoreIndirizzo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VettoreLocalita: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PesoLordo: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    PesoNetto: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    NumeroColli: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DataDiTrasporto: {
      type: DataTypes.DATE,
      allowNull: true
    },
    OraDiTrasporto: {
      type: DataTypes.DATE,
      allowNull: true
    },
    BollaEsportata: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Valorizzata: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    TotaleBolla: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    NumeroFattura: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DataFattura: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsEvasa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    TipoMezzo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MezzoMittente: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    MezzoDestinatario: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    MezzoVettore: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    AspettoBeni: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Annotazioni: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'bolle_scarico_testate',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['AnnoBolla', 'NumeroBolla'],
        name: 'AnnoBolla_NumeroBolla_unique'
      },
      { fields: ['AnnoBolla'], name: 'AnnoBolla' },
      { fields: ['NumeroBolla'], name: 'NumeroBolla' },
      { fields: ['DataBolla'], name: 'DataBolla' },
      { fields: ['ClienteCodice'], name: 'ClienteCodice' }
    ]
  }
);

module.exports = BolleScaricoTestate;
