const { Op } = require('sequelize');
const moment = require('moment');
const TeamSystemOrdini = require('../models/bi/TeamSystemOrdini');

module.exports.findAllByYear = async (anno) => {
  const startDateOfTheYear = moment(anno);
  const endDateOfTheYear = moment(anno).endOf('year');
  return TeamSystemOrdini.findAll({
    where: {
      DataOrdine: {
        [Op.between]: [startDateOfTheYear, endDateOfTheYear]
      }
    }
  });
};
