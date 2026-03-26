const { dbBi } = require('../lib/db');
const { ContatoreMisurazioneMetano, ContatoreMetano } = require('../models/bi');

module.exports.saveData = async (misurazioni) => {
  const promises = misurazioni.map((misurazione) => ContatoreMisurazioneMetano.upsert(misurazione));
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  ContatoreMisurazioneMetano.findAll({
    where: dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('data')), year),
    include: [ContatoreMetano]
  });

module.exports.deleteData = async (id) => ContatoreMisurazioneMetano.destroy({ where: { id } });
