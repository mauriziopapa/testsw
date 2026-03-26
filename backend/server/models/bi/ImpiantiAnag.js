const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ImpiantiAnag = dbBi.sequelizeBi.define(
  'impianti_anag',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome_impianto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gruppo_impianto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ordine: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'impianti_anag'
  }
);

module.exports = ImpiantiAnag;
