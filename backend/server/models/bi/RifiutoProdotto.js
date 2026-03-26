const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const Rifiuto = require('./Rifiuto');

const RfiutoProdotto = dbBi.sequelizeBi.define(
  'rifiuti_prodotti',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_rifiuto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Rifiuto,
        key: 'id'
      }
    },
    nome_rifiuto: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quantita: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  },
  {
    tableName: 'rifiuti_prodotti'
  }
);

module.exports = RfiutoProdotto;
