const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Widget = db.sequelize.define(
  'widget',
  {
    id: {
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
      allowNull: false
    },
    info_kpi: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fonti: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    percorso: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ass_pos: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'widget'
  }
);

module.exports = Widget;
