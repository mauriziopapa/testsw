const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getCostoNC = async (anno, trimestre, tipologia) => {
  const sql = `
  SELECT SUM(IFNULL(CostoLavorazioni, 0)) as somma
  FROM commesse_nc 
  LEFT JOIN tempo ON tempo.\`data\` = commesse_nc.DataNC
  WHERE TipoNC = :tipologia AND
      tempo.trimestre = :trimestre AND tempo.anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { tipologia, trimestre, anno },

    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].somma : 0;
  return val;
};

module.exports.getKpiSummTrimestre = async (tempoItem, kpi_num) => {
  const sql = `
  SELECT SUM(IFNULL(CostoLavorazioni, 0)) AS somma
  FROM tempo_mesi
  LEFT JOIN commesse_nc 
    ON tempo_mesi.anno = commesse_nc.AnnoNC 
    AND tempo_mesi.mese_num = MONTH(commesse_nc.DataNC)
  WHERE TipoNC = :kpi_num
    AND tempo_mesi.trimestre = :trimestre 
    AND tempo_mesi.anno = :anno 
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
