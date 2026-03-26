/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getTempo = async (dal, al) => {
  const const_mesi = `date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date('${dal}') 
  AND date(concat(anno, '-',mese_num, '-01')) <= date('${al}')`;

  const sql = `
    SELECT DISTINCT 
      trimestre, 
      anno, 
      concat(trimestre, '-', anno) AS label
    FROM tempo_mesi 
    WHERE ${const_mesi} 
    ORDER BY anno, mese_num`;

  const tempo = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return tempo;
};

module.exports.getTempoMese = async (dal, al) => {
  const sql = `
  SELECT DISTINCT 
    mese_num as mese, anno, concat(mese_num, '-', anno) AS label 
  FROM tempo_mesi 
  WHERE 
    date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)
  ORDER BY anno, mese_num`;

  const tempo = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return tempo;
};

module.exports.getTempoSemestre = async (dal, al) => {
  const sql = `
  SELECT DISTINCT 
  semestre_num, anno, CONCAT(semestre, ' ', anno) AS label 
  FROM tempo_mesi 
  WHERE  anno >= :dal AND anno <= :al
  ORDER BY anno, semestre_num`;

  const tempo = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return tempo;
};

module.exports.getTempoAnnuale = async (dal, al) => {
  const sql = `
  SELECT DISTINCT anno, anno AS label 
  FROM tempo_mesi 
  WHERE date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)
  ORDER BY anno`;

  const tempo = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return tempo;
};
