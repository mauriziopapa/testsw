const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const Contatore = require('./Contatore');

const ContatoreMisurazione = dbBi.sequelizeBi.define(
  'contatori_misurazioni',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_contatore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Contatore,
        key: 'id'
      }
    },
    nome_contatore: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: true
    },
    misurazione: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  },
  {
    tableName: 'contatori_misurazioni'
  }
);

module.exports = ContatoreMisurazione;
