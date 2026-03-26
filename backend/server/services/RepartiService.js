const moment = require('moment');
const BIConstants = require('../models/bi/BIConstants');
const KpiProduzione = require('../models/bi/KpiProduzione');
const { buildDalAl } = require('../lib/time');
const { dbBi } = require('../lib/db');

const { Op } = dbBi.Sequelize;

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getReparti = async (filters) => {
  // const { dal, al } = buildDalAl(filters.from, filters.to);
  // const from = moment(dal);
  // const to = moment(al);

  // const repartiBefore2023 = { [Op.not]: [BIConstants.IND.label, BIConstants.CBF.label] };
  // Tenifer, POZZO e ALU non vengono considerati più
  const repartiAfter2023 = {
    [Op.in]: [BIConstants.NCV_CIEFFE.label, BIConstants.NCV_IPSEN.label, BIConstants.LLF.label, BIConstants.TV.label]
  };

  // Per il momento Temprasud ha chiesto di non mostrare più TENIFER e POZZO
  // const yearIsAfter2023 = [from.year(), to.year()].includes(2023) && from.isBefore(to);
  // const impiantoCondition = yearIsAfter2023 ? { reparto: repartiAfter2023 } : { reparto: repartiBefore2023 };
  const impiantoCondition = { reparto: repartiAfter2023 };
  const condition = { [Op.and]: [impiantoCondition] };

  return KpiProduzione.findAll({
    attributes: [
      // specify an array where the first element is the SQL function and the second is the alias
      [dbBi.sequelizeBi.fn('DISTINCT', dbBi.sequelizeBi.col('reparto')), 'reparto']
    ],
    where: condition
  });
};
