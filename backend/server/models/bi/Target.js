const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Target = dbBi.sequelizeBi.define(
  'target',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    widget: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    target2: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'target'
  }
);

module.exports = Target;
