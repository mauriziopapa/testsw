/* eslint-disable implicit-arrow-linebreak */
const MappingMateriePrimeMpTS = require('../models/bi/MappingMateriePrimeMpTS');
const MateriaPrima = require('../models/bi/MateriaPrima');
const MateriaPrimaLavorazione = require('../models/bi/MateriaPrimaLavorazione');
const MateriaPrimaTS = require('../models/bi/MateriaPrimaTS');

module.exports.findAll = async () => MateriaPrima.findAll();
module.exports.findAllMateriePrimeLavorazioni = async () => MateriaPrimaLavorazione.findAll();
module.exports.findAllMappingMateriePrime = async () =>
  MappingMateriePrimeMpTS.findAll({ include: [MateriaPrima, MateriaPrimaTS] });
module.exports.findAllMappingMateriePrimeWhere = async (where) =>
  MappingMateriePrimeMpTS.findAll({ where, include: [MateriaPrima, MateriaPrimaTS] });

module.exports.deleteMapping = async (id) => MappingMateriePrimeMpTS.destroy({ where: { id } });

module.exports.update = async (materiePrime) => {
  const promises = materiePrime.map((mp) => MappingMateriePrimeMpTS.upsert(mp));
  const output = await Promise.all(promises);
  return output;
};
