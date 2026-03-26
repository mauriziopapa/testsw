const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ConcorrenteAnag = dbBi.sequelizeBi.define(
  'concorrenti_anag',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cod_azienda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nome_azienda: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'concorrenti_anag'
  }
);

module.exports = ConcorrenteAnag;
