const md5 = require('md5');

const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const User = db.sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING
    },
    surname: {
      type: DataTypes.STRING
    },
    theme: {
      type: DataTypes.STRING
    },
    logins: {
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: true,
    paranoid: true,
    // Other model options go here
    hooks: {
      beforeCreate: async (user) => {
        // eslint-disable-next-line no-param-reassign
        user.password = md5(user.password);
      }
    },
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] }
      }
    }
  }
);

User.prototype.comparePassword = async function comparePassword(candidate) {
  const candidateMd5 = md5(candidate);
  return candidateMd5 === this.password;
};

module.exports = User;
