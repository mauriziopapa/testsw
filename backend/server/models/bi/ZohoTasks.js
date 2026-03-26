const { DataTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ZohoTasks = dbBi.sequelizeBi.define(
  'zp_task',
  {
    table_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    p_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    p_group_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    p_group_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    p_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    p_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    completed: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    completed_time: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    owners_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    owners_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    key_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    synced: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    deleted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    }
  },
  {
    tableName: 'zp_task',
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'id_owners_id',
        fields: ['id', 'owners_id']
      }
    ]
  }
);

module.exports = ZohoTasks;
