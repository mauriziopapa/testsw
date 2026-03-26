const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

module.exports.getTarget = async (inputTarget, inputKpi) => {
  const anno = inputTarget != null ? parseInt(inputTarget) : '';
  const widget = inputKpi != null ? parseInt(inputKpi) : '';
  const sqlTarget = `SELECT ifnull(target, 0) AS target
                    FROM target
                    WHERE anno = :anno
                    AND widget = :widget`;

  const target = await dbBi.sequelizeBi.query(sqlTarget, {
    replacements: { anno, widget },
    type: QueryTypes.SELECT
  });

  return target[0] ? target[0].target : null;
};
