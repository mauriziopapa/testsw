/* eslint-disable max-len */
const { QueryTypes } = require('sequelize');

const config = require('../config').jobKpiTabelle;

const { dbBi } = require('../lib/db');

const log = config.log();

module.exports.getOreDiFunzionamento = async (impianto, anno, mese) => {
  log.info(
    `Recupero i movimenti dal Prosys per l'impianto ${impianto.DescrizioneCentro} per anno=${anno} e mese=${mese}`
  );

  const sql = `
  SELECT
    *
  FROM
    dati_forni_datawarehouse dfd
  WHERE
    YEAR(Inizio) = :anno
    AND MONTH(Inizio) = :mese
    AND CodCentro = :forno
  `;

  const results = await dbBi.sequelizeBi.query(sql, {
    replacements: { forno: impianto.CodCentroProsys, anno, mese },
    type: QueryTypes.SELECT
  });

  log.info(
    `Trovati tot. ${results.length} movimenti dal Prosys per l'impianto ${impianto.DescrizioneCentro} per anno=${anno} e mese=${mese}`
  );

  return results;
};
