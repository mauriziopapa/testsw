const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const FornitoreTS = require('./FornitoreTS');

const MateriaPrimaTS = dbBi.sequelizeBi.define(
  'teamsystem_materieprime',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CodFornitore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: FornitoreTS,
        key: 'id'
      }
    },
    CodArticolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DesArticolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    FamArticolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DesFam: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SFamArticolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DesSFam: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_materieprime'
  }
);

module.exports = MateriaPrimaTS;
