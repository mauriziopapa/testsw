const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const BudgetProgetti = dbBi.sequelizeBi.define(
  'budget_progetti',
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
    budget: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  },
  {
    tableName: 'budget_progetti'
  }
);

module.exports = BudgetProgetti;
