const { DataTypes } = require('sequelize');
const { db } = require('../../lib/db');

const Securable = require('./Securable');
const Role = require('./Role');

const SecurableRole = db.sequelize.define(
  'securable_role',
  {
    securable_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Securable,
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id'
      }
    },
    can_create: {
      type: DataTypes.BOOLEAN
    },
    can_read: {
      type: DataTypes.BOOLEAN
    },
    can_update: {
      type: DataTypes.BOOLEAN
    },
    can_delete: {
      type: DataTypes.BOOLEAN
    }
  },
  {
    tableName: 'securables_roles',
    timestamps: true,
    paranoid: true
  }
);

module.exports = SecurableRole;
