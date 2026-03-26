/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const { QueryTypes } = require("sequelize");
const { dbBi } = require("../../lib/db");
const { buildDalAl } = require("../../lib/time");
const TargetService = require("./TargetService");

const config = require("../../config")[process.env.NODE_ENV || "local"];
const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { from, to, target } = filters;
  const { dal, al } = buildDalAl(from, to);

  // Periodo -1 anno
  const prevDal = shiftYear(dal, -1);
  const prevAl = shiftYear(al, -1);

  // Periodo -2 anni
  const prev2Dal = shiftYear(dal, -2);
  const prev2Al = shiftYear(al, -2);

  const risorse = await getRisorse();
  const targetLevel = await TargetService.getTarget(target, 147);

  const [twoYearsAgoData, previousYearData, currentYearData] = await Promise.all([
    getKpiForPeriod(prev2Dal, prev2Al, risorse),
    getKpiForPeriod(prevDal, prevAl, risorse),
    getKpiForPeriod(dal, al, risorse),
  ]);

  const results = [
    buildStackedStructure("Periodo - 2y", twoYearsAgoData, targetLevel),
    buildStackedStructure("Periodo - 1y", previousYearData, targetLevel),
    buildStackedStructure("Periodo", currentYearData, targetLevel),
  ];

  return results;
};

function shiftYear(date, diff) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + diff);
  return d.toISOString().split("T")[0];
}

async function getKpiForPeriod(from, to, risorse) {
  const promises = risorse.map(async (risorsa) => {
    const kpi = await getKpi(from, to, risorsa.owners_id);
    return {
      label: risorsa.owners_name,
      kpi,
    };
  });

  return Promise.all(promises);
}

function buildStackedStructure(label, kpiData, target) {
  const values = kpiData.map(({ label, kpi }) => ({
    label,
    data: kpi,
  }));

  return {
    label,
    valori: values,
    target,
  };
}

async function getKpi(from, to, ownerId) {
  const sql = `
    SELECT IFNULL(COUNT(*), 0) AS val
    FROM zp_task
    WHERE start_date BETWEEN :from AND :to
      AND deleted = 0
      AND owners_id = :ownerId
    UNION ALL
    SELECT SUM(IFNULL(val, 0)) AS val
    FROM kpi_lab_qua
    WHERE kpi = 39
      AND CONCAT(anno, '-', LPAD(mese,2,'0'), '-01') BETWEEN :from AND :to
  `;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to, ownerId },
    type: QueryTypes.SELECT,
  });

  if (kpi.length > 0) {
    return kpi.reduce((sum, a) => sum + (a.val || 0), 0);
  }
  return 0;
}

async function getRisorse() {
  const sql = `
    SELECT DISTINCT 
      owners_id,
      owners_name
    FROM zp_task
    WHERE owners_name != "Sergio Rutigliano"
  `;
  return dbBi.sequelizeBi.query(sql, { type: QueryTypes.SELECT });
}
