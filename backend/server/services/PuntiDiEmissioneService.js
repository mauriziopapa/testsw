const PuntoDiEmissione = require('../models/bi/PuntoDiEmissione');

module.exports.findAll = async () => PuntoDiEmissione.findAll();

module.exports.findOneById = async (id) => PuntoDiEmissione.findByPk(id);
