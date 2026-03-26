const Inquinante = require('../models/bi/Inquinante');
const LimitiInquinanti = require('../models/bi/LimitiInquinanti');
const PuntoDiEmissione = require('../models/bi/PuntoDiEmissione');

module.exports.findAll = async () => LimitiInquinanti.findAll({ include: [Inquinante, PuntoDiEmissione] });

module.exports.findOneById = async (id) => LimitiInquinanti.findByPk(id);
