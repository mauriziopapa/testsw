const sequelize = require('sequelize');
const RiepilogoClienti = require('../models/bi/RiepilogoClienti');

module.exports.findAll = async () => RiepilogoClienti.findAll();
module.exports.findAllByYear = async (anno) => RiepilogoClienti.findAll({ where: { anno } });
module.exports.findOneById = async (id) => RiepilogoClienti.findByPk(id);
module.exports.findUniqueYears = async () =>
  RiepilogoClienti.findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('anno')), 'anno']] });
