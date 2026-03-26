const DipendenteTS = require('../models/bi/DipendenteTS');

module.exports.getDipendenti = async () => DipendenteTS.findAll();

module.exports.upsertOne = async (dipendente) => DipendenteTS.upsert(dipendente);
module.exports.upsertAll = async (dipendenti) => {
  const promises = dipendenti.map((dipendente) => DipendenteTS.upsert(dipendente));
  const output = await Promise.all(promises);
  return output;
};
