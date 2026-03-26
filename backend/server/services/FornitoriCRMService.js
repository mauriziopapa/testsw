const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.findAll = async () => {
  const query = `
    SELECT DISTINCT 
      fornitori.id_crm as CodiceFornitore,
      name as RagioneSociale
    FROM
      fornitori_con_ordini
    LEFT JOIN fornitori ON
      fornitori.id_crm = fornitori_con_ordini.id_crm
    WHERE
      fornitori.monitora = 1
    UNION ALL
    SELECT
      '-Tutti-' AS CodiceFornitore,
      '-Tutti-' AS RagioneSociale
    ORDER BY
      RagioneSociale`;

  const result = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });

  return result;
};
