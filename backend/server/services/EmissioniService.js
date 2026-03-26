const { dbBi } = require('../lib/db');
const Emissioni = require('../models/bi/Emissioni');

module.exports.findAll = async (anno, mese) => {
  const emissioni = await Emissioni.findAll({
    where: [
      dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('data')), parseInt(anno)),
      dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('MONTH', dbBi.sequelizeBi.col('data')), parseInt(mese))
    ]
  });
  return emissioni;
};

module.exports.findOneById = async (id) => {
  const emissione = await Emissioni.findByPk(id);
  return emissione;
};

module.exports.update = async (emissioni) => {
  const promises = emissioni.map((emissione) => Emissioni.upsert(emissione));
  const output = await Promise.all(promises);
  return output;
};

module.exports.deleteData = async (id) => Emissioni.destroy({ where: { id } });
