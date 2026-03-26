const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const FattureTestate = dbBi.sequelizeBi.define(
  'fatture_testate',
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
    DataFattura: {
      type: DataTypes.DATE
    },
    FatturaEsportata: {
      type: DataTypes.STRING
    },
    CausaleMagazzino: {
      type: DataTypes.STRING
    },
    CodiceCliente: {
      type: DataTypes.STRING
    },
    CodiceSede: {
      type: DataTypes.STRING
    },
    CodiceValuta: {
      type: DataTypes.STRING
    },
    CodicePagamento: {
      type: DataTypes.STRING
    },
    CodiceBanca: {
      type: DataTypes.STRING
    },
    CodiceAgenzia: {
      type: DataTypes.STRING
    },
    CodiceIBAN: {
      type: DataTypes.STRING
    },
    CodiceAgente: {
      type: DataTypes.STRING
    },
    Sconto_1_Chiusura: {
      type: DataTypes.DOUBLE
    },
    Sconto_2_Chiusura: {
      type: DataTypes.DOUBLE
    },
    Sconto_Pagamento: {
      type: DataTypes.DOUBLE
    },
    Lordo_Merce: {
      type: DataTypes.DOUBLE
    },
    Netto_Merce: {
      type: DataTypes.DOUBLE
    },
    Spese_Incasso: {
      type: DataTypes.DOUBLE
    },
    Spese_Trasporto: {
      type: DataTypes.DOUBLE
    },
    Spese_Accessorie: {
      type: DataTypes.DOUBLE
    },
    Importo_Bolli: {
      type: DataTypes.DOUBLE
    },
    Ind_Addebito_Bolli: {
      type: DataTypes.STRING
    },
    Ind_Addebito_Spese: {
      type: DataTypes.STRING
    },
    Riferimento: {
      type: DataTypes.STRING
    },
    Annotazioni: {
      type: DataTypes.STRING
    },
    Cod_IVA_1: {
      type: DataTypes.STRING
    },
    Cod_IVA_2: {
      type: DataTypes.STRING
    },
    Cod_IVA_3: {
      type: DataTypes.STRING
    },
    Cod_IVA_4: {
      type: DataTypes.STRING
    },
    Cod_IVA_5: {
      type: DataTypes.STRING
    },
    Imponibile_1: {
      type: DataTypes.DOUBLE
    },
    Imponibile_2: {
      type: DataTypes.DOUBLE
    },
    Imponibile_3: {
      type: DataTypes.DOUBLE
    },
    Imponibile_4: {
      type: DataTypes.DOUBLE
    },
    Imponibile_5: {
      type: DataTypes.DOUBLE
    },
    IVA_1: {
      type: DataTypes.DOUBLE
    },
    IVA_2: {
      type: DataTypes.DOUBLE
    },
    IVA_3: {
      type: DataTypes.DOUBLE
    },
    IVA_4: {
      type: DataTypes.DOUBLE
    },
    IVA_5: {
      type: DataTypes.DOUBLE
    },
    Totale_Imponibile: {
      type: DataTypes.DOUBLE
    },
    Totale_IVA: {
      type: DataTypes.DOUBLE
    },
    Totale_Documento: {
      type: DataTypes.DOUBLE
    },
    Acconto: {
      type: DataTypes.DOUBLE
    },
    Contrassegno: {
      type: DataTypes.DOUBLE
    },
    Imponibile_Omaggio: {
      type: DataTypes.DOUBLE
    },
    Imponibile_Provvigio: {
      type: DataTypes.DOUBLE
    },
    Importo_Provvigioni: {
      type: DataTypes.DOUBLE
    }
  },
  {
    tableName: 'fatture_testate',
    timestamps: false, // If you don't have timestamps like createdAt, updatedAt
    indexes: [
      { unique: true, fields: ['AnnoFattura', 'NumeroFattura'], name: 'Unico' },
      { fields: ['AnnoFattura'], name: 'AnnoFattura' },
      { fields: ['NumeroFattura'], name: 'NumeroFattura' },
      { fields: ['DataFattura'], name: 'DataFattura' },
      { fields: ['AnnoFattura', 'NumeroFattura'], name: 'AnnoFattura_NumeroFattura' }
    ]
  }
);

module.exports = FattureTestate;
