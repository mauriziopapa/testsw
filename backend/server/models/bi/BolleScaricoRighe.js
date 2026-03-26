const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const BolleScaricoRighe = dbBi.sequelizeBi.define(
  'bolle_scarico_righe',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    IDRiga: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Progressivo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AnnoBolla: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mese_num: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    SerieBolla: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NumeroBolla: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroCommessa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CodiceArticolo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DescrizioneArticolo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Pezzi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Peso: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    InizioGruppoCommessa: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    TipoRiga: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroCommessaSenzaAnno: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Grassetto: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  },
  {
    tableName: 'bolle_scarico_righe',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['AnnoBolla', 'NumeroBolla', 'Progressivo'],
        name: 'AnnoBolla_NumeroBolla_Progressivo'
      },
      { fields: ['AnnoBolla'], name: 'AnnoBolla' },
      { fields: ['NumeroBolla'], name: 'NumeroBolla' },
      { fields: ['NumeroCommessa'], name: 'NumeroCommessa' }
    ]
  }
);

module.exports = BolleScaricoRighe;
