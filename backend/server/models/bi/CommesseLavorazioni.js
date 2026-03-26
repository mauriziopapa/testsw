const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const CommesseLavorazioni = dbBi.sequelizeBi.define(
  'CommesseLavorazioni',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    NumeroCommessa: {
      type: DataTypes.STRING(50)
    },
    Sequenza: {
      type: DataTypes.DOUBLE
    },
    IDLavorazione: {
      type: DataTypes.STRING(20)
    },
    Programma: {
      type: DataTypes.TEXT('tiny')
    },
    Impianto: {
      type: DataTypes.INTEGER
    },
    LavorazioneSuCarica: {
      type: DataTypes.BOOLEAN
    },
    LavorazioneSuCommessa: {
      type: DataTypes.BOOLEAN
    },
    Note: {
      type: DataTypes.TEXT('tiny')
    },
    TipoCentroLavoro: {
      type: DataTypes.TEXT('tiny')
    },
    PrezzoTotale: {
      type: DataTypes.DOUBLE
    },
    InFattura: {
      type: DataTypes.BOOLEAN
    },
    InBolla: {
      type: DataTypes.BOOLEAN
    },
    GruppoLav: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'commesse_lavorazioni',
    timestamps: false,
    indexes: [{ fields: ['NumeroCommessa'] }, { fields: ['IDLavorazione'] }]
  }
);

module.exports = CommesseLavorazioni;
