const { Op } = require('sequelize');
const moment = require('moment');
const ZohoTasks = require('../models/bi/ZohoTasks');

module.exports.findAllByYear = async (anno) => {
  const startDateOfTheYear = moment(anno);
  const endDateOfTheYear = moment(anno).endOf('year');
  return ZohoTasks.findAll({
    where: {
      start_date: {
        [Op.between]: [startDateOfTheYear, endDateOfTheYear]
      }
    }
  });
};
