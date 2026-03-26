const Contatore = require('../models/bi/Contatore');
const ContatoreLavorazione = require('../models/bi/ContatoreLavorazione');

module.exports.findAll = async () => Contatore.findAll();
module.exports.findAllContatoriLavorazioni = async () => ContatoreLavorazione.findAll();

module.exports.findOneById = async (id) => Contatore.findByPk(id);

module.exports.upsert = async (contatori) => {
  const promises = contatori.map((contatore) => Contatore.upsert(contatore));
  const output = await Promise.all(promises);
  return output;
};
