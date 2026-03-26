const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Role = require('./Role');
const User = require('./User');

const UserRoles = db.sequelize.define(
  'user_role',
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
    paranoid: true
  }
);

module.exports = UserRoles;
