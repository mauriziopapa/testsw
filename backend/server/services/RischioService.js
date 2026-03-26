const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');

module.exports.getArticoliByRischio = async (rischio) => {
  const sql = `
  SELECT DISTINCT 
    ta.* 
  FROM
    teamsystem_articoli ta
  WHERE
    ta.GruStat2 = :rischio`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { rischio },
    type: QueryTypes.SELECT
  });

  return fornitori;
};

module.exports.getRischi = () => {
  const fornitori = [
    { id_rischio: '-Tutti-', nome_rischio: '-Tutti-' },
    { id_rischio: 'A', nome_rischio: 'Alto' },
    { id_rischio: 'B', nome_rischio: 'Medio' },
    { id_rischio: 'C', nome_rischio: 'Basso' }
  ];
  /*
  const sql = `
  SELECT DISTINCT
    ta.*
  FROM
    teamsystem_articoli ta
  WHERE
    ta.GruStat2 = :rischio`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { rischio },
    type: QueryTypes.SELECT
  });
  */
  return fornitori;
};
