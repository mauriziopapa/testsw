const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const CommesseNC = dbBi.sequelizeBi.define(
  'CommesseNC',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
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
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Commessa: {
      // tinytext in MySQL
      type: DataTypes.TEXT('tiny'),
      allowNull: true
    },
    SottoCommessa: {
      // tinytext in MySQL
      type: DataTypes.TEXT('tiny'),
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
    CodiceReparto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DescrNC: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DescrCausaNC: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PropostaDiRisoluzione: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    AzioneCorrettiva: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DataAzioneCorrettiva: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    EsitoAzioneCorrettiva: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    IDOperatoreAzioneCorrettiva: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    VerificaAzioneCorrettiva: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DataVerificaAzioneCorrettiva: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Costi: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    IDOperatoreQualita: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDOperatoreReparto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDOperatoreProduzione: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DescChiusNC: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Deroga: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NCChiusa: {
      // char(1)
      type: DataTypes.STRING(1),
      allowNull: true
    },
    DataChiusNC: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    IDOperatoreChiusuraNC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    RiferimentoDocumenti: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    FlagAzioneCorrettiva: {
      // char(1)
      type: DataTypes.STRING(1),
      allowNull: true
    },
    Flag8D: {
      // char(1)
      type: DataTypes.STRING(1),
      allowNull: true
    },
    FlagAutomotive: {
      // char(1)
      type: DataTypes.STRING(1),
      allowNull: true
    },
    CostoLavorazioni: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    CostoAddebito: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    PezziNonConformi: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'commesse_nc',
    timestamps: false,
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    engine: 'InnoDB',
    indexes: [
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

module.exports = CommesseNC;
