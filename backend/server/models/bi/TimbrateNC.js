const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const TimbrateNC = dbBi.sequelizeBi.define(
  'TimbrateNC',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    IDMovCommessa: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NumeroCommessa: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    SottoCommessa: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    IDLavorazione: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Peso: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Pezzi: {
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
    DataNC: {
      type: DataTypes.DATE, // datetime in MySQL
      allowNull: true
    },
    Carica: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TipoNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CausaNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DescrNC: {
      type: DataTypes.TEXT('long'), // longtext
      allowNull: true
    },
    IDAzione: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CodiceReparto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDAzioneNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DescrAzioneNC: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CodiceAzioneNC: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    // Opzioni del modello
    tableName: 'timbrate_nc',
    timestamps: false, // La tabella non ha createdAt/updatedAt
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    engine: 'InnoDB',
    indexes: [
      {
        name: 'idx_idMovCommessa',
        fields: ['IDMovCommessa'],
        comment: 'Indice per ricerca rapida per ID Movimento Commessa'
      },
      {
        name: 'idx_numeroCommessa',
        fields: ['NumeroCommessa'],
        comment: 'Indice per ricerca per Numero Commessa'
      },
      {
        name: 'idx_annoNC_numeroNC',
        fields: ['AnnoNC', 'NumeroNC'],
        comment: 'Indice combinato per Anno e Numero NC'
      },
      {
        name: 'idx_dataNC',
        fields: ['DataNC'],
        comment: 'Indice per ricerca per Data NC'
      },
      {
        name: 'idx_codiceReparto',
        fields: ['CodiceReparto'],
        comment: 'Indice per ricerca per Reparto'
      }
    ]
  }
);

module.exports = TimbrateNC;
