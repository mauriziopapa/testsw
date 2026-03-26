const moment = require('moment');
const { dbBi } = require('../../lib/db');
const OrdineMateriaPrimaAnnualeTS = require('../../models/bi/OrdineMateriaPrimaAnnualeTS');
const OrdineMateriaPrimaMensileTS = require('../../models/bi/OrdineMateriaPrimaMensileTS');
const OrdineMateriaPrimaTS = require('../../models/bi/OrdineMateriaPrimaTS');

const { Op } = dbBi.Sequelize;

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getOrdiniMateriePrimeAnnuali = async (anno, materiaPrima = '') => {
  const mpCodition = materiaPrima !== '-Tutti-' ? { codice_articolo: materiaPrima } : null;
  const condition = {
    [Op.and]: [{ anno }, mpCodition]
  };

  const materiePrime = await OrdineMateriaPrimaAnnualeTS.findAll({
    where: condition
  });

  return materiePrime;
};

module.exports.getOrdiniMateriePrimeMensili = async (anno, mese, materiaPrima = '') => {
  const mpCodition = materiaPrima !== '-Tutti-' ? { codice_articolo: materiaPrima } : null;
  const condition = {
    [Op.and]: [{ anno, mese }, mpCodition]
  };

  const materiePrime = await OrdineMateriaPrimaMensileTS.findAll({
    where: condition
  });

  return materiePrime;
};

module.exports.getOrdiniMateriePrime = async (dal, al, fornitore = '') => {
  // Se Sequelize riceve una string fa lui la conversione
  // tenendo conto del fuso orario e portando indietro l'orario
  const from = moment(dal);
  const to = moment(al);

  const fornitoreCodition = fornitore !== '-Tutti-' ? { IdFornitore: fornitore } : null;
  const condition = {
    [Op.and]: [
      {
        DataOrdine: {
          [Op.between]: [from, to]
        }
      },
      fornitoreCodition
    ]
  };

  const materiePrime = await OrdineMateriaPrimaTS.findAll({
    where: condition
  });

  return materiePrime;
};

module.exports.getOrdiniMateriePrimeEvasi = async (dal, al, fornitore = '') => {
  // Se Sequelize riceve una string fa lui la conversione
  // tenendo conto del fuso orario e portando indietro l'orario
  const from = moment(dal);
  const to = moment(al);

  const fornitoreCodition = fornitore !== '-Tutti-' ? { IdFornitore: fornitore } : null;
  const condition = {
    [Op.and]: [
      {
        DataOrdine: {
          [Op.between]: [from, to]
        },
        DataEvasione: {
          [Op.ne]: null
        },
        DataPrevConsegna: {
          [Op.ne]: null
        }
      },
      fornitoreCodition
    ]
  };

  const materiePrime = await OrdineMateriaPrimaTS.findAll({
    where: condition
  });

  return materiePrime;
};
