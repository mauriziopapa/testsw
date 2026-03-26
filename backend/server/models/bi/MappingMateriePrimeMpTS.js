const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const MateriaPrimaTS = require('./MateriaPrimaTS');
const MateriaPrima = require('./MateriaPrima');

const MappingMateriePrimeMpTS = dbBi.sequelizeBi.define(
  'mapping_materieprime_mpts',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_materiaprima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MateriaPrima,
        key: 'id'
      }
    },
    id_materiaprima_ts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MateriaPrimaTS,
        key: 'id'
      }
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'mapping_materieprime_mpts'
  }
);

module.exports = MappingMateriePrimeMpTS;
