const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.findAll = async () => {
  const query = `
    SELECT
      DISTINCT CONCAT(prodotti_new.idz, "@", prodotti_new.fk_fornitore) AS CodArticolo,
      TRIM(CONCAT(prodotti_new.name, " - ", replace(f.rag_sociale, '"', "'"))) AS DesArticolo
    FROM
      prodotti_new
    LEFT JOIN fornitori AS f ON
      f.id_crm = prodotti_new.fk_fornitore
    WHERE
      tipologia = "Materia Prima"
      AND fk_fornitore IS NOT NULL
    UNION ALL
    SELECT
      '-Tutti-' AS CodArticolo,
      '-Tutti-' AS DesArticolo
    ORDER BY
      DesArticolo ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });

  return result;
};
