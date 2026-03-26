const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

const KpiProduzione = require('../models/bi/KpiProduzione');

module.exports.findAll = async () => KpiProduzione.findAll();

module.exports.findOneById = async (id) => KpiProduzione.findByPk(id);

module.exports.upsert = async (kpi) => {
  const promises = kpi.map((kpiproduzione) => KpiProduzione.upsert(kpiproduzione));
  const output = await Promise.all(promises);
  return output;
};

module.exports.getValoreKpiProduzione = async (from, to, kpi, reparto) => {
  const query = `
  SELECT SUM(ifnull(val, 0)) as val
  FROM kpi_produzione kp 
  WHERE kpi = :kpi 
    AND reparto = :reparto 
    AND STR_TO_DATE(CONCAT(anno, '-', mese, '-01'), '%Y-%m-%d') BETWEEN :from and :to `;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { kpi, reparto, from, to },
    type: QueryTypes.SELECT
  });
  return result[0] && result[0].val ? result[0].val : 0;
};
