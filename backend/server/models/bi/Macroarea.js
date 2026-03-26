const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Macroarea = dbBi.sequelizeBi.define(
  'macroaree',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    macroarea: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'macroaree'
  }
);

module.exports = Macroarea;
