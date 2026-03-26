const Budget = require('../models/bi/Budget');

module.exports.findAll = async () => Budget.findAll();
module.exports.findAllWhere = async (where) => Budget.findAll(where);

module.exports.findOneById = async (id) => Budget.findByPk(id);

module.exports.upsert = async (budgets) => {
  const promises = budgets.map((budget) => Budget.upsert(budget));
  const output = await Promise.all(promises);
  return output;
};
