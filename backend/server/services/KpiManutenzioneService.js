const KpiManutenzione = require('../models/bi/KpiManutenzione');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.findAll = async () => KpiManutenzione.findAll();

module.exports.findOneById = async (id) => KpiManutenzione.findByPk(id);

module.exports.upsert = async (kpi) => {
  const promises = kpi.map((kpiManutenzione) => KpiManutenzione.upsert(kpiManutenzione));
  const output = await Promise.all(promises);
  return output;
};

module.exports.getKpi = async (mese, anno, kpiNum) => {
  const query = `
  SELECT ifnull(val, 0) AS val, ifnull(val_12m, 0) AS val_12m 
  FROM kpi_manutenzione
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
  FROM kpi_manutenzione
  WHERE  kpi = :kpiNum AND anno = :anno`;

  const kpiAvg = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, kpiNum },
    type: QueryTypes.SELECT
  });
  return kpiAvg.length > 0 ? kpiAvg[0].avg : 0;
};
// Funzione aggiornata per gestire ogni oggetto `tempo`
module.exports.getKpiSummTrimestre = async (tempoItem, kpi_num) => {
  const sql = `
  SELECT SUM(ifnull(val, 0)) as somma
  FROM tempo_mesi
  LEFT JOIN kpi_lab_qua ON tempo_mesi.anno = kpi_lab_qua.anno AND tempo_mesi.mese_num = kpi_lab_qua.mese 
  WHERE kpi = :kpi_num
  AND (tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno) 
  GROUP BY tempo_mesi.trimestre`;

  try {
    const kpiSum = await dbBi.sequelizeBi.query(sql, {
      replacements: { kpi_num, trimestre: tempoItem.trimestre, anno: tempoItem.anno },
      type: QueryTypes.SELECT
    });

    const summ = kpiSum.length > 0 ? kpiSum[0].somma : 0;
    return summ;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
};
