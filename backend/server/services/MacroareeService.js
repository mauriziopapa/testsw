const Macroarea = require('../models/bi/Macroarea');

module.exports.getMacroaree = async () => Macroarea.findAll();
