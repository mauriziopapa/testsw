const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const WidgetInstance = db.sequelize.define(
  'widget_instance',
  {
    idwidget_instance: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idwidget: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_dashboard: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    visible: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'widget_instance'
  }
);

module.exports = WidgetInstance;
