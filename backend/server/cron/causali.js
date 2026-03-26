const CausaliTS = require('../models/bi/CausaliTS');

module.exports.getCausali = async () => CausaliTS.findAll();

module.exports.getCausaliMalattia = async () => CausaliTS.findAll({ where: { tipo: 'ORE MALATTIA' } });
module.exports.getCausaliStraordinario = async () => CausaliTS.findAll({ where: { tipo: 'ORE STRAORDINARIO' } });
module.exports.getCausaliOrdinario = async () => CausaliTS.findAll({ where: { tipo: 'ORE LAVORATE ORDINARIE' } });
module.exports.getCausaliFerieResidue = async () => CausaliTS.findAll({ where: { tipo: 'FERIE RESIDUE' } });
