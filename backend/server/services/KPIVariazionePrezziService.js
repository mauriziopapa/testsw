const VariazionePrezzi = require('../models/bi/VariazionePrezzi');

module.exports.findAll = async () => VariazionePrezzi.findAll();

module.exports.findOneByAnno = async (anno) => VariazionePrezzi.findAll({ where: { anno } });

module.exports.findOneById = async (id) => VariazionePrezzi.findByPk(id);

module.exports.update = async (row) => {
  const found = await VariazionePrezzi.findAll({ where: { anno: row.anno } });
  if (found) {
    found[0].variazione = row.variazione;
    const output = await found[0].save();
    return output;
  }
  return null;
};
