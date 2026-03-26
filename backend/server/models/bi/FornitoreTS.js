const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const FornitoreTS = dbBi.sequelizeBi.define(
  'teamsystem_fornitori',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CodiceFornitore: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RagioneSociale: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'teamsystem_fornitori'
  }
);

module.exports = FornitoreTS;
