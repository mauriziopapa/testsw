const CdlGruppo = require('../models/bi/CdlGruppo');

module.exports.getCdlGruppi = async () => CdlGruppo.findAll();
