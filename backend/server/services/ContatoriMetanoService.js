const ContatoreMetano = require('../models/bi/ContatoreMetano');
const ContatoreLavorazione = require('../models/bi/ContatoreLavorazione');

module.exports.findAll = async () => ContatoreMetano.findAll();
module.exports.findAllContatoriLavorazioni = async () => ContatoreLavorazione.findAll();

module.exports.findOneById = async (id) => ContatoreMetano.findByPk(id);

module.exports.upsert = async (contatori) => {
  const promises = contatori.map((contatore) => ContatoreMetano.upsert(contatore));
  const output = await Promise.all(promises);
  return output;
};
