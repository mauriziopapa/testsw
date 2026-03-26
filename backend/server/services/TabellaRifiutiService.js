const { dbBi } = require('../lib/db');
const { RifiutoProdotto, Rifiuto } = require('../models/bi');

module.exports.saveData = async (rifiuti) => {
  const promises = rifiuti.map((rifiuto) => RifiutoProdotto.upsert(rifiuto));
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  RifiutoProdotto.findAll({
    where: dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('data')), year),
    include: [Rifiuto]
  });

module.exports.delete = async (id) => RifiutoProdotto.destroy({ where: { id } });
