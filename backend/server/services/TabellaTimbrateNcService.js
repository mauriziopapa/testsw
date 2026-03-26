const { Op } = require('sequelize');
const moment = require('moment');
const TimbrateNC = require('../models/bi/TimbrateNC');

module.exports.findAllByYear = async (anno) => {
  const startDateOfTheYear = moment(anno);
  const endDateOfTheYear = moment(anno).endOf('year');
  return TimbrateNC.findAll({
    where: {
      DataNC: {
        [Op.between]: [startDateOfTheYear, endDateOfTheYear]
      }
    }
  });
};
