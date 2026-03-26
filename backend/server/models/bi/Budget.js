const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Budget = dbBi.sequelizeBi.define(
  'budget',
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
    mese_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    plan: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    plan_cum: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    budget: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    budget_cum: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'budget'
  }
);

module.exports = Budget;
