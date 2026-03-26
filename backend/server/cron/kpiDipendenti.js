const { QueryTypes } = require('sequelize');
const config = require('../config').jobDipendenti;

const { dbBi } = require('../lib/db');

const log = config.log();

const KPI_DIPENDENTI = 16;

module.exports.updateKpiNumDipendenti = async (azienda) => {
  log.info(`Updating table kpi_personale for kpi ${KPI_DIPENDENTI} for azienda=${azienda}.`);
  const result = await getKpi(KPI_DIPENDENTI, azienda);
  const promises = result.map((r) => updateTable(r.val, r.anno, r.mese, r.kpi));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

const getKpi = async (kpi, azienda) => {
  // Sottraggo -1 per l'amministratore delegato
  const sql = `
  SELECT
    YEAR(NOW()) as anno,
    MONTH (NOW()) as mese,
    ${kpi} as kpi,
    COUNT(*) - 2 as val
  FROM
    teamsystemhr_dipendenti td
  WHERE
    td.azienda = :azienda
    AND licenziamento IS NULL`;

  const kpis = await dbBi.sequelizeBi.query(sql, {
    replacements: { azienda },
    type: QueryTypes.SELECT
  });

  return kpis;
};

const updateTable = async (val, anno, mese, kpi) => {
  const sql = `
    UPDATE kpi_personale
    SET  val=:val
    WHERE anno = :anno AND mese = :mese AND kpi = :kpi and forzatura_manuale != 1;
    `;

  const kpis = await dbBi.sequelizeBi.query(sql, {
    replacements: { val, anno, mese, kpi },
    type: QueryTypes.UPDATE
  });

  return kpis;
};
