const Inquinante = require('../models/bi/Inquinante');

module.exports.findAll = async () => Inquinante.findAll();

module.exports.findOneById = async (id) => Inquinante.findByPk(id);
