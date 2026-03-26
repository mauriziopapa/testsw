const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ContrattiTestate = dbBi.sequelizeBi.define(
  'ContrattiTestate',
  {
    IDContratto: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    IDCliente: {
      type: DataTypes.STRING(10)
    },
    IDArticolo: {
      type: DataTypes.INTEGER
    },
    ProgressivoContratto: {
      type: DataTypes.INTEGER
    },
    NrRevisione: {
      type: DataTypes.INTEGER
    },
    DescrizioneContratto: {
      type: DataTypes.STRING(255)
    },
    ContrattoAttivo: {
      type: DataTypes.BOOLEAN
    },
    CodiceReparto: {
      type: DataTypes.INTEGER
    },
    Ciclo: {
      type: DataTypes.STRING(10)
    },
    IDCentro: {
      type: DataTypes.INTEGER
    },
    Priorità: {
      type: DataTypes.INTEGER
    },
    PesoIdealeCarica: {
      type: DataTypes.DECIMAL(10, 2)
    },
    NormeRif: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    IDPianoCampionamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDConfezionamento: {
      type: DataTypes.INTEGER
    },
    IndiceRevisione: {
      type: DataTypes.STRING(10)
    },
    Capitolato: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    SpecificheControllo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NoteDaStampare: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NoteInterne: {
      type: DataTypes.TEXT
    },
    NoteDatiVecchi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NoteCollaudo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NoteRiesame: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    DataRevisione: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DataCreazione: {
      type: DataTypes.DATE
    },
    IDOperatoreRevisione: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDOperatore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DataOperatore: {
      type: DataTypes.DATE
    },
    NrUtilizzi: {
      type: DataTypes.INTEGER
    },
    DataUltimoUtilizzo: {
      type: DataTypes.DATE
    },
    StampaSchedaLaboratorio: {
      type: DataTypes.BOOLEAN
    },
    GruppoStatistico: {
      type: DataTypes.STRING(10)
    },
    Offerta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDCriticita: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ConControlloCondizionale: {
      type: DataTypes.BOOLEAN
    },
    ControlloCondizionalePerColata: {
      type: DataTypes.BOOLEAN
    },
    ControlloCondizionaleLimiteFornate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ControlloCondizionaleLimiteGiorni: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ControlloCondizionaleLimiteAvviso: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDSettoreApplicativo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PercorsoDisegnoTecnico: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PezziIdealiCarica: {
      type: DataTypes.INTEGER
    },
    IDMateriale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MetalloCliente: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PesoPezzo: {
      type: DataTypes.DECIMAL(10, 2)
    },
    SuperficiePezzo: {
      type: DataTypes.DECIMAL(10, 2)
    },
    Posizionamento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    CategoriaPosizionamento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ClassePosizionamento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PzOraPosizionamento: {
      type: DataTypes.INTEGER
    },
    PzOraRimozione: {
      type: DataTypes.INTEGER
    },
    MarcaturaPrevista: {
      type: DataTypes.BOOLEAN
    },
    PrezzoMedioVendita: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  },
  {
    tableName: 'contratti_testate',
    timestamps: false
  }
);

module.exports = ContrattiTestate;
