const { dbBi } = require('../lib/db');
const { ContatoreMisurazione, Contatore } = require('../models/bi');

module.exports.saveData = async (misurazioni) => {
  const promises = misurazioni.map((misurazione) => ContatoreMisurazione.upsert(misurazione));
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  ContatoreMisurazione.findAll({
    where: dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('data')), year),
    include: [Contatore]
  });

module.exports.deleteData = async (id) => ContatoreMisurazione.destroy({ where: { id } });
