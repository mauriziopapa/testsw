const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Dashboard = db.sequelize.define(
  'dashboard',
  {
    iddashboard: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'dashboard'
  }
);

module.exports = Dashboard;
