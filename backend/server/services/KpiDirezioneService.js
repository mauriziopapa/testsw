const KpiDirezione = require('../models/bi/KpiDirezione');

module.exports.findAll = async () => KpiDirezione.findAll();

module.exports.findOneById = async (id) => KpiDirezione.findByPk(id);

module.exports.upsert = async (kpi) => {
  const promises = kpi.map((kpiDirezione) => KpiDirezione.upsert(kpiDirezione));
  const output = await Promise.all(promises);
  return output;
};
