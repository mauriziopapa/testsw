const Rifiuto = require('../models/bi/Rifiuto');
const RifiutoLavorazione = require('../models/bi/RifiutoLavorazione');

module.exports.findAll = async () => Rifiuto.findAll();
module.exports.findAllRifiutiLavorazioni = async () => RifiutoLavorazione.findAll();

module.exports.findOneById = async (id) => Rifiuto.findByPk(id);

module.exports.upsert = async (rifiuti) => {
  const promises = rifiuti.map((rifiuto) => Rifiuto.upsert(rifiuto));
  const output = await Promise.all(promises);
  return output;
};
