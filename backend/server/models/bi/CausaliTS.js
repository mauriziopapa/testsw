const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const CausaliTS = dbBi.sequelizeBi.define(
  'teamsystemhr_causali',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    causale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descrizione: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystemhr_causali'
  }
);

module.exports = CausaliTS;
