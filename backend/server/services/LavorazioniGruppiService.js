const LavorazioneGruppo = require('../models/bi/LavorazioneGruppo');

module.exports.getLavorazioneGruppo = async () => LavorazioneGruppo.findAll();
