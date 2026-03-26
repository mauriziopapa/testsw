const CommesseNC = require('../models/bi/CommesseNC');

module.exports.findAllByYear = async (anno) => {
  return CommesseNC.findAll({
    where: {
      AnnoNC: anno
    }
  });
};
