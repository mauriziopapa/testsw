const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const FattureRighe = dbBi.sequelizeBi.define(
  'fatture_righe',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    AnnoFattura: {
      type: DataTypes.INTEGER
    },
    mese_num: {
      type: DataTypes.INTEGER
    },
    NumeroFattura: {
      type: DataTypes.INTEGER
    },
    SerieFattura: {
      type: DataTypes.STRING
    },
    NrRiga: {
      type: DataTypes.DOUBLE
    },
    CodiceArticolo: {
      type: DataTypes.STRING
    },
    DescrizioneArticolo: {
      type: DataTypes.STRING
    },
    Um: {
      type: DataTypes.STRING
    },
    Quantita: {
      type: DataTypes.DOUBLE
    },
    PrezzoUnitario: {
      type: DataTypes.DOUBLE
    },
    ImportoRiga: {
      type: DataTypes.DOUBLE
    },
    CodiceIVA: {
      type: DataTypes.STRING
    },
    NumeroCommessa: {
      type: DataTypes.STRING
    },
    TipoRiga: {
      type: DataTypes.DOUBLE
    },
    Pezzi: {
      type: DataTypes.INTEGER
    },
    Peso: {
      type: DataTypes.DOUBLE
    },
    AnnoBolla: {
      type: DataTypes.DOUBLE
    },
    NumeroBolla: {
      type: DataTypes.INTEGER
    },
    ScontoArticolo: {
      type: DataTypes.DOUBLE
    }
  },
  {
    tableName: 'fatture_righe',
    timestamps: false, // If you don't have timestamps like createdAt, updatedAt
    indexes: [
      {
        unique: true,
        fields: ['AnnoFattura', 'NumeroFattura', 'NrRiga'],
        name: 'AnnoFattura_mese_num_NumeroFattura_NrRiga'
      },
      { fields: ['AnnoFattura'], name: 'AnnoFattura' },
      { fields: ['NumeroFattura'], name: 'NumeroFattura' },
      { fields: ['AnnoFattura', 'NumeroFattura'], name: 'AnnoFattura_NumeroFattura' },
      { fields: ['ImportoRiga'], name: 'ImportoRiga' }
    ]
  }
);

module.exports = FattureRighe;
