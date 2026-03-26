const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Role = db.sequelize.define(
  'role',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    paranoid: true
  }
);

module.exports = Role;
