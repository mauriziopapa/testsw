const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const OreTS = dbBi.sequelizeBi.define(
  'teamsystemhr_ore',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    azienda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false
    },
    causale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ore: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    matricola: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo_assenza: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'teamsystemhr_ore'
  }
);

module.exports = OreTS;
