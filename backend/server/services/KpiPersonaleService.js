const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.getKpi = async (mese, anno, kpiNum) => {
  const query = `
  SELECT ifnull(val, 0) AS val, ifnull(val_12m, 0) AS val_12m 
  FROM kpi_personale
  WHERE 
  kpi = :kpiNum AND 
  anno = :anno AND mese = :mese`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { mese, anno, kpiNum },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0] : { val: 0, val_12m: 0 };
};

module.exports.getKpiAverage = async (anno, kpiNum) => {
  const query = `
  SELECT AVG(ifnull(val, 0)) AS avg
  FROM kpi_personale
  WHERE  kpi = :kpiNum AND anno = :anno`;

  const kpiAvg = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, kpiNum },
    type: QueryTypes.SELECT
  });
  return kpiAvg.length > 0 ? kpiAvg[0].avg : 0;
};

module.exports.getKpiAverageInterval = async (from, to, kpiNum) => {
  const query = `
  SELECT AVG(ifnull(val, 0)) AS avg
  FROM kpi_personale
  WHERE kpi = :kpiNum AND STR_TO_DATE(CONCAT(anno, '-', mese, '-01'), '%Y-%m-%d') BETWEEN :from and :to`;

  const kpiAvg = await dbBi.sequelizeBi.query(query, {
    replacements: { kpiNum, from, to },
    type: QueryTypes.SELECT
  });
  return kpiAvg.length > 0 ? kpiAvg[0].avg : 0;
};

module.exports.getKpiAndAnno = async (mese, anno, kpiNum) => {
  const query = `
  SELECT 
    ifnull(val, 0) AS val, 
    anno 
  FROM kpi_personale
  WHERE 
  kpi = :kpiNum AND 
  anno = :anno AND mese = :mese`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { mese, anno, kpiNum },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0] : { val: 0, anno: 0 };
};

module.exports.getAnni = async (dal, al) => {
  const query = `
  SELECT DISTINCT anno
  FROM kpi_personale
  WHERE anno >= :dal AND anno <= :al
  ORDER BY anno ASC`;

  const anni = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });
  return anni;
};
