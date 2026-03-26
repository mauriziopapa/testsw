/* eslint-disable camelcase */
const { dbBi } = require('../lib/db');
const ImpiantiAnag = require('../models/bi/ImpiantiAnag');

module.exports.findAll = async () => ImpiantiAnag.findAll();

module.exports.findOneById = async (id) => ImpiantiAnag.findByPk(id);

module.exports.findAllByGruppo = async (gruppo_impianto) => ImpiantiAnag.findAll({ where: { gruppo_impianto } });

module.exports.findAllGruppi = async () =>
  // eslint-disable-next-line implicit-arrow-linebreak
  ImpiantiAnag.findAll({
    attributes: [[dbBi.sequelizeBi.fn('DISTINCT', dbBi.sequelizeBi.col('gruppo_impianto')), 'gruppo_impianto']]
  });
