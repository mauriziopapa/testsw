const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const CostiLaboratorio = dbBi.sequelizeBi.define(
  'costi_laboratorio',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trimestre_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trimestre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    costi: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    provini: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'costi_laboratorio'
  }
);

module.exports = CostiLaboratorio;
