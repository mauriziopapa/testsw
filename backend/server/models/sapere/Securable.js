const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Securable = db.sequelize.define(
  'securable',
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
    }
  },
  {
    timestamps: true,
    paranoid: true
  }
);

module.exports = Securable;
