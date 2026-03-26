const { Op } = require('sequelize');
const moment = require('moment');
const TeamSystemOrdiniMateriePrime = require('../models/bi/TeamSystemOrdiniMateriePrime');

module.exports.findAllByYear = async (anno) => {
  const startDateOfTheYear = moment(anno);
  const endDateOfTheYear = moment(anno).endOf('year');
  return TeamSystemOrdiniMateriePrime.findAll({
    where: {
      DataOrdine: {
        [Op.between]: [startDateOfTheYear, endDateOfTheYear]
      }
    }
  });
};
