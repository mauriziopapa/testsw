const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const datiCaricaReparto = await buildData(filters.anno, filters.reparto);
  return datiCaricaReparto;
};

async function buildData(tempo, reparto) {
  const kpiValues = await getKpi(tempo, reparto);
  return kpiValues;
}

async function getKpi(anno, reparto) {
  const query = `
  select
  ciclo, 
  ROUND(IF(a_2018 = 0, NULL, a_2018), 2) AS a_2018,
  ROUND(IF(n_2018 = 0, NULL, n_2018), 2) AS n_2018,
  ROUND((p_2018/1000)*100, 2) AS p_2018,
  ROUND(IF(a_2019 = 0, NULL, a_2019), 2) AS a_2019,
  ROUND(IF(n_2019 = 0, NULL, n_2019), 2) AS n_2019,
  ROUND((p_2019/1000)*100, 2) AS p_2019,
  ROUND(IF(a_2020 = 0, NULL, a_2020), 2) AS a_2020,
  ROUND(IF(n_2020 = 0, NULL, n_2020), 2) AS n_2020,
  ROUND((p_2020/1000)*100, 2) AS p_2020,
  ROUND(IF(a_2021 = 0, NULL, a_2021), 2) AS a_2021,
  ROUND(IF(n_2021 = 0, NULL, n_2021), 2) AS n_2021,
  ROUND((p_2021/1000)*100, 2) AS p_2021,
  ROUND(IF(a_2022 = 0, NULL, a_2022), 2) AS a_2022,
  ROUND(IF(n_2022 = 0, NULL, n_2022), 2) AS n_2022,
  ROUND((p_2022/1000)*100, 2) AS p_2022,
  ROUND(IF(a_2023 = 0, NULL, a_2023), 2) AS a_2023,
  ROUND(IF(n_2023 = 0, NULL, n_2023), 2) AS n_2023,
  ROUND((p_2023/1000)*100, 2) AS p_2023,
  ROUND(IF(a_2024 = 0, NULL, a_2024), 2) AS a_2024,
  ROUND(IF(n_2024 = 0, NULL, n_2024), 2) AS n_2024,
  ROUND((p_2024/1000)*100, 2) AS p_2024,
  ROUND(IF(a_2025 = 0, NULL, a_2025), 2) AS a_2025,
  ROUND(IF(n_2025 = 0, NULL, n_2025), 2) AS n_2025,
  ROUND((p_2025/1000)*100, 2) AS p_2025
  from riepilogo_fornate_girata
  WHERE ciclo IN
  (SELECT DISTINCT ciclo FROM riepilogo_fornate WHERE anno = :anno AND reparto = :reparto AND kg_fornate IS NOT NULL)
  AND reparto = :reparto `;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, reparto },
    type: QueryTypes.SELECT
  });
  return kpi;
}
