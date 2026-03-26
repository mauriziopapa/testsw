const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const ContrattiTestate = require('./ContrattiTestate'); // Importing ContrattiTestate for association

const ContrattiRighe = dbBi.sequelizeBi.define(
  'ContrattiRighe',
  {
    IDContratto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'ContrattiTestate',
        key: 'IDContratto'
      }
    },
    Sequenza: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    IDLavorazione: {
      type: DataTypes.STRING(50)
    },
    InFattura: {
      type: DataTypes.BOOLEAN
    },
    InBolla: {
      type: DataTypes.BOOLEAN
    },
    Programma: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    IDCentro: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    LavorazioneSuCarica: {
      type: DataTypes.BOOLEAN
    },
    LavorazioneSuCommessa: {
      type: DataTypes.BOOLEAN
    },
    MinutiLavorati: {
      type: DataTypes.INTEGER
    },
    PezziLavorati: {
      type: DataTypes.INTEGER
    },
    KgLavorati: {
      type: DataTypes.DECIMAL(10, 2)
    },
    PezziPerOra: {
      type: DataTypes.DECIMAL(10, 2)
    },
    OreImpegnate: {
      type: DataTypes.INTEGER
    },
    TempoAttrezzaggio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ColpiPerPezzo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PercorsoIsola: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    NrAlternativa: {
      type: DataTypes.INTEGER
    },
    DescrAlternativa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IDAllegato1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IDAllegato2: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'contratti_righe',
    timestamps: false
  }
);

// Association between ContrattiTestate and ContrattiRighe
ContrattiTestate.hasMany(ContrattiRighe, { foreignKey: 'IDContratto' });
ContrattiRighe.belongsTo(ContrattiTestate, { foreignKey: 'IDContratto' });

module.exports = ContrattiRighe;
