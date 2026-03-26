const { QueryTypes } = require('sequelize');
const FornitoreTS = require('../models/bi/FornitoreTS');
const MateriaPrimaTS = require('../models/bi/MateriaPrimaTS');

const { dbBi } = require('../lib/db');

module.exports.findAllDistinct = async () =>
  // eslint-disable-next-line implicit-arrow-linebreak
  MateriaPrimaTS.findAll({
    attributes: [
      [dbBi.sequelizeBi.fn('DISTINCT', dbBi.sequelizeBi.col('CodArticolo')), 'CodArticolo'],
      'DesArticolo',
      'SFamArticolo',
      'CodFornitore',
      'id'
    ],
    order: ['DesArticolo']
  });

module.exports.findAllWithFornitori = async () =>
  // eslint-disable-next-line implicit-arrow-linebreak
  MateriaPrimaTS.findAll({ order: ['DesArticolo'], include: [FornitoreTS] });

module.exports.getMateriePrimeByRischio = async (risks) => {
  const sql = `
      SELECT DISTINCT 
        ta.CodArticolo, ta.DesArticolo, ta.GruStat2, ta.DesGruStat2
      FROM
        teamsystem_articoli ta
      WHERE
        ta.GruStat2 IN (:risks)
      ORDER BY DesArticolo ASC`;

  const materiePrime = await dbBi.sequelizeBi.query(sql, {
    replacements: { risks },
    type: QueryTypes.SELECT
  });

  return materiePrime;
};
