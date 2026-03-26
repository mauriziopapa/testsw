const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const FilterValue = db.sequelize.define(
  'filter_values',
  {
    idfilter_values: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idfilter: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    default_value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idwidget_instance: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'filter_values'
  }
);

module.exports = FilterValue;
