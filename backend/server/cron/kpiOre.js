const { QueryTypes } = require('sequelize');
const config = require('../config').jobOre;

const { dbBi } = require('../lib/db');

const log = config.log();

const {
  getCausaliMalattia,
  getCausaliStraordinario,
  getCausaliOrdinario,
  getCausaliFerieResidue
} = require('./causali');

const KPI_MALATTIA = 10;
const KPI_STRAORDINARIO = 11;
const KPI_FERIE_RESIDUE = 12;
const KPI_ORDINARIO = 15;

module.exports.updateKpiMalattia = async (azienda) => {
  log.info(`Updating table kpi_personale for kpi ${KPI_MALATTIA} for azienda=${azienda}.`);
  const causaliMalattia = await getCausaliMalattia();
  const causali = causaliMalattia.map((c) => c.causale);
  const result = await getKpi(KPI_MALATTIA, azienda, causali);
  const promises = result.map((r) => updateTable(r.val, r.anno, r.mese, r.kpi));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

module.exports.updateKpiStraordinario = async (azienda) => {
  log.info(`Updating table kpi_personale for kpi ${KPI_STRAORDINARIO} for azienda=${azienda}.`);
  const causaliStraordinario = await getCausaliStraordinario();
  const causali = causaliStraordinario.map((c) => c.causale);
  const result = await getKpi(KPI_STRAORDINARIO, azienda, causali);
  const promises = result.map((r) => updateTable(r.val, r.anno, r.mese, r.kpi));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

module.exports.updateKpiOrdinario = async (azienda) => {
  log.info(`Updating table kpi_personale for kpi ${KPI_ORDINARIO} for azienda=${azienda}.`);
  const causaliOrdinario = await getCausaliOrdinario();
  const causali = causaliOrdinario.map((c) => c.causale);
  const result = await getKpi(KPI_ORDINARIO, azienda, causali);
  const promises = result.map((r) => updateTable(r.val, r.anno, r.mese, r.kpi));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

module.exports.updateKpiFerieResidue = async (azienda) => {
  log.info(`Updating table kpi_personale for kpi ${KPI_FERIE_RESIDUE} for azienda=${azienda}.`);
  const causaliFerieResidue = await getCausaliFerieResidue();
  const causali = causaliFerieResidue.map((c) => c.causale);
  const result = await getKpi(KPI_FERIE_RESIDUE, azienda, causali);
  const promises = result.map((r) => updateTable(r.val, r.anno, r.mese, r.kpi));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

const getKpi = async (kpi, azienda, causali) => {
  const sql = `
      SELECT
      year(data) as anno,
      month(data) as mese,
      ${kpi} as kpi,
      sum(ore) as val
    FROM
      teamsystemhr_ore
    WHERE
      azienda = :azienda AND causale IN (:causali) and year(data) >= 2023
    GROUP BY
      month(data),
      year(data)`;

  const kpis = await dbBi.sequelizeBi.query(sql, {
    replacements: { azienda, causali },
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
