const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Commessa = dbBi.sequelizeBi.define(
  'Commessa',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    'Numero Commessa': {
      type: DataTypes.STRING(50),
      unique: 'NumeroCommessaUK'
    },
    'Codice Cliente': {
      type: DataTypes.STRING(50)
    },
    'Nome Cliente': {
      type: DataTypes.STRING(255)
    },
    IDBolla: {
      type: DataTypes.INTEGER
    },
    IDRigaBolla: {
      type: DataTypes.INTEGER
    },
    'Numero Bolla': {
      type: DataTypes.TEXT('tiny')
    },
    'Data Bolla': {
      type: DataTypes.DATE
    },
    ConsegnatoDa: {
      type: DataTypes.TEXT('tiny')
    },
    IDProdotto: {
      type: DataTypes.INTEGER
    },
    CodiceProdotto: {
      type: DataTypes.STRING(50)
    },
    'Descrizione Prodotto': {
      type: DataTypes.TEXT('tiny')
    },
    CodiceContratto: {
      type: DataTypes.INTEGER
    },
    PrioritaCommessa: {
      type: DataTypes.DOUBLE
    },
    'Flag Evasa': {
      type: DataTypes.CHAR(1)
    },
    DataChiusura: {
      type: DataTypes.DATE
    },
    Peso: {
      type: DataTypes.DOUBLE
    },
    PesoEvaso: {
      type: DataTypes.DOUBLE
    },
    Pezzi: {
      type: DataTypes.INTEGER
    },
    PezziEvasi: {
      type: DataTypes.INTEGER
    },
    Diametro: {
      type: DataTypes.TEXT('tiny')
    },
    Materiale: {
      type: DataTypes.TEXT('tiny')
    },
    Imballaggio: {
      type: DataTypes.TEXT('tiny')
    },
    QtaImballoEvasa: {
      type: DataTypes.DOUBLE
    },
    Ciclo: {
      type: DataTypes.TEXT('tiny')
    },
    IDCentro: {
      type: DataTypes.INTEGER
    },
    Scansia: {
      type: DataTypes.TEXT('tiny')
    },
    FlagStampata: {
      type: DataTypes.CHAR(1)
    },
    NoteCommessa: {
      type: DataTypes.TEXT('tiny')
    },
    NrRevisione: {
      type: DataTypes.DOUBLE
    },
    SottoCommessa: {
      type: DataTypes.DOUBLE
    },
    DurezzaControllo: {
      type: DataTypes.TEXT('tiny')
    },
    Temperatura: {
      type: DataTypes.DOUBLE
    },
    Tempo: {
      type: DataTypes.DOUBLE
    },
    Posizionamento: {
      type: DataTypes.TEXT('tiny')
    },
    DocWord: {
      type: DataTypes.TEXT('tiny')
    },
    DocExcel: {
      type: DataTypes.TEXT('tiny')
    },
    Deroga: {
      type: DataTypes.TEXT('tiny')
    },
    NumNonConformita: {
      type: DataTypes.DOUBLE
    },
    FlagNonConforme: {
      type: DataTypes.CHAR(1)
    },
    CommessaNCPrecedente: {
      type: DataTypes.TEXT('tiny')
    },
    FlagBlocco: {
      type: DataTypes.CHAR(1)
    },
    NumeroLotto: {
      type: DataTypes.TEXT('tiny')
    },
    NoMinimoVoce: {
      type: DataTypes.STRING(50)
    },
    NumAcconto: {
      type: DataTypes.DOUBLE
    },
    IndiceRevisione: {
      type: DataTypes.TEXT('tiny')
    },
    Colata: {
      type: DataTypes.TEXT('tiny')
    },
    Capitolato: {
      type: DataTypes.TEXT('tiny')
    },
    SpecificheControllo: {
      type: DataTypes.TEXT('tiny')
    },
    NormeRif: {
      type: DataTypes.TEXT('tiny')
    },
    IDConfezionamento: {
      type: DataTypes.INTEGER
    },
    StampaCollaudo: {
      type: DataTypes.STRING(50)
    },
    IDPianoCampionamento: {
      type: DataTypes.INTEGER
    },
    NumPezzi: {
      type: DataTypes.DOUBLE
    },
    TipoControllo: {
      type: DataTypes.DOUBLE
    },
    PezziScarto: {
      type: DataTypes.INTEGER
    },
    PesoScarto: {
      type: DataTypes.DOUBLE
    },
    IDGruppo: {
      type: DataTypes.TEXT('tiny')
    },
    DataEvasione: {
      type: DataTypes.DATE
    },
    DataConcordata: {
      type: DataTypes.DATE
    },
    CommessaCliente: {
      type: DataTypes.TEXT('tiny')
    },
    NumeroOrdine: {
      type: DataTypes.TEXT('tiny')
    },
    DataOrdine: {
      type: DataTypes.DATE
    },
    Note1: {
      type: DataTypes.TEXT('tiny')
    },
    Note2: {
      type: DataTypes.TEXT('tiny')
    },
    DestinazioneDiversa: {
      type: DataTypes.TEXT('tiny')
    },
    DataRicMat: {
      type: DataTypes.DATE
    },
    'ID Operatore': {
      type: DataTypes.INTEGER
    },
    'Data Operatore': {
      type: DataTypes.DATE
    },
    Carica: {
      type: DataTypes.TEXT('tiny')
    },
    CommessaValorizzata: {
      type: DataTypes.STRING(50)
    },
    PezziCampionatura: {
      type: DataTypes.INTEGER
    },
    Interna: {
      type: DataTypes.CHAR(1)
    },
    Jomini20: {
      type: DataTypes.TEXT('tiny')
    },
    PezziCli: {
      type: DataTypes.INTEGER
    },
    PesoCli: {
      type: DataTypes.DOUBLE
    },
    SeqLavDaFare: {
      type: DataTypes.DOUBLE
    },
    StampaSchedaLaboratorio: {
      type: DataTypes.CHAR(1)
    },
    CausaleMagazzinoNC: {
      type: DataTypes.TEXT('tiny')
    },
    NoteCliente: {
      type: DataTypes.TEXT('tiny')
    },
    Disegno: {
      type: DataTypes.TEXT('tiny')
    },
    DataProd: {
      type: DataTypes.DATE
    },
    Marcatura: {
      type: DataTypes.TEXT('tiny')
    },
    IDStabilimento: {
      type: DataTypes.INTEGER
    },
    MaterialePronto: {
      type: DataTypes.CHAR(1)
    },
    DurezzaRiga: {
      type: DataTypes.DOUBLE
    },
    ProfonditaRiga: {
      type: DataTypes.DOUBLE
    },
    ConPreTrattamento: {
      type: DataTypes.CHAR(1)
    },
    ConPostTrattamento: {
      type: DataTypes.CHAR(1)
    },
    NIR_Elenco: {
      type: DataTypes.TEXT('tiny')
    },
    NrCarica: {
      type: DataTypes.INTEGER
    },
    Pianificata: {
      type: DataTypes.CHAR(1)
    },
    Collaudata: {
      type: DataTypes.CHAR(1)
    },
    ConConsegne: {
      type: DataTypes.CHAR(1)
    },
    AnnoDDTccLavoro: {
      type: DataTypes.DOUBLE
    },
    NrDDTccLavoro: {
      type: DataTypes.DOUBLE
    },
    SerieDDTccLavoro: {
      type: DataTypes.TEXT('tiny')
    },
    macroarea: {
      type: DataTypes.TINYINT
    }
  },
  {
    tableName: 'commesse',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['NumeroCommessa'], name: 'NumeroCommessaUK' },
      { fields: ['CodiceCliente'] },
      { fields: ['DataBolla'] },
      { fields: ['DataChiusura'] },
      { fields: ['FlagEvasa'] },
      { fields: ['macroarea'] },
      { fields: ['IDProdotto'] },
      { fields: ['CodiceProdotto'] }
    ]
  }
);

module.exports = Commessa;
