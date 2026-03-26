const SezionaleOfferteTS = require('../models/bi/SezionaleOfferteTS');

module.exports.findAll = async () => SezionaleOfferteTS.findAll();
module.exports.findOneByDescrizione = async (descrizione) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  SezionaleOfferteTS.findOne({ where: { descrizione } });
