const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  define: {
    timestamps: false
  }
});

const sequelizeBi = new Sequelize(
  process.env.DB_BI_DATABASE_NAME,
  process.env.DB_BI_USERNAME,
  process.env.DB_BI_PASSWORD,
  {
    host: process.env.DB_BI_HOST,
    port: process.env.DB_BI_PORT,
    dialect: process.env.DB_BI_DIALECT,
    define: {
      timestamps: false
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.connect = async () => sequelize.authenticate();

const dbBi = {};
dbBi.Sequelize = Sequelize;
dbBi.sequelizeBi = sequelizeBi;
dbBi.connect = async () => sequelizeBi.authenticate();

module.exports.db = db;
module.exports.dbBi = dbBi;
