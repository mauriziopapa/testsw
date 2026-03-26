const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const TeamsystemHrDipendentiCount = dbBi.sequelizeBi.define(
  'teamsystemhr_dipendenti_count',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    count_dipendenti: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modified_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    azienda: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reparto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'teamsystemhr_dipendenti_count'
  }
);

module.exports = TeamsystemHrDipendentiCount;
