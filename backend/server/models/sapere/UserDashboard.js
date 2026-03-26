const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const User = require('./User');
const Dashboard = require('./Dashboard');

const UserDashboard = db.sequelize.define(
  'user_dashboard',
  {
    iduser_dashboard: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    iduser: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    iddashboard: {
      type: DataTypes.INTEGER,
      references: {
        model: Dashboard,
        key: 'iddashboard'
      }
    },
    visible: {
      type: DataTypes.BOOLEAN
    },
    order: {
      type: DataTypes.INTEGER
    },
    columns: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 'user_dashboard'
  }
);

module.exports = UserDashboard;
