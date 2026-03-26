const CostiLaboratorio = require('../models/bi/CostiLaboratorio');

module.exports.saveData = async (costiLaboratorio) => {
  const costiPromises = costiLaboratorio.map((costo) => CostiLaboratorio.update(costo, { where: { id: costo.id } }));
  const output = await Promise.all(costiPromises);
  return output;
};

module.exports.getData = async (anno) => {
  const costi = await CostiLaboratorio.findAll({ where: { anno } });
  return costi;
};
