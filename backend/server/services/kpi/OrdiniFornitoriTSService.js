const moment = require('moment');
const { dbBi } = require('../../lib/db');
const FornitoreTS = require('../../models/bi/FornitoreTS');
const OrdineTS = require('../../models/bi/OrdineTS');

const { Op } = dbBi.Sequelize;

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getOrdini = async (dal, al, fornitore = '') => {
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

  const ordini = await OrdineTS.findAll({
    where: condition,
    include: [FornitoreTS]
  });

  return ordini;
};

module.exports.getOrdiniEvasi = async (dal, al, fornitore = '') => {
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

  const ordini = await OrdineTS.findAll({
    where: condition,
    include: [FornitoreTS]
  });

  return ordini;
};

module.exports.getOrdiniEffettivi = (ordini) => {
  // rimuovo ordini con NumeroOrdine uguale
  const ordiniEffettivi = ordini.filter(
    (value, index, self) => index === self.findIndex((t) => t.NumeroOrdine === value.NumeroOrdine)
  );
  return ordiniEffettivi;
};

module.exports.calculateDelayDays = (ordini) => {
  const delayDays = ordini.map((ordine) => {
    const dataEvasione = moment(ordine.DataEvasione);
    const dataPrevConsegna = moment(ordine.DataPrevConsegna);
    // dataEvasione - dataPrevConsegna
    if (dataEvasione.isSame(dataPrevConsegna)) {
      return 0;
    }
    const delay = getWorkdayCount(dataPrevConsegna, dataEvasione);
    return delay > 0 ? delay : 0;
  });
  return delayDays;
};

module.exports.calculateLeadTimeDays = (ordini) => {
  const leadTimeDays = ordini.map((ordine) => {
    const dataOrdine = moment(ordine.DataOrdine);
    const dataPrevConsegna = moment(ordine.DataPrevConsegna);
    // dataPrevConsegna - dataOrdine
    return getWorkdayCount(dataOrdine, dataPrevConsegna);
  });
  return leadTimeDays;
};

function getWorkdayCount(start, end) {
  const first = start.clone().endOf('week'); // end of first week
  const last = end.clone().startOf('week'); // start of last week
  const days = (last.diff(first, 'days') * 5) / 7; // this will always multiply of 7
  let wfirst = first.day() - start.day(); // check first week
  if (start.day() === 0) --wfirst; // -1 if start with sunday
  let wlast = end.day() - last.day(); // check last week
  if (end.day() === 6) --wlast; // -1 if end with saturday
  return wfirst + Math.floor(days) + wlast; // get the total
} //

module.exports.calculateOrdiniInRitardo = (ordini) => {
  // Un ordine è considerato in ritardo se:
  // la data di evasione supera la data di prevista consegna
  const ordiniInRitardo = ordini.filter((ordine) => {
    const dataEvasione = moment(ordine.DataEvasione);
    const dataPrevConsegna = moment(ordine.DataPrevConsegna);
    return dataEvasione.isAfter(dataPrevConsegna);
  });
  return ordiniInRitardo;
};

module.exports.calculateOrdiniInRitardoPiuDi2Giorni = (ordini) => {
  // Qui un ordine è considerato in ritardo se:
  // la data di evasione supera la data di prevista consegna di più di 2 giorni
  const ordiniInRitardo = ordini.filter((ordine) => {
    const dataEvasione = moment(ordine.DataEvasione);
    const dataPrevConsegna = moment(ordine.DataPrevConsegna);
    const days = getWorkdayCount(dataPrevConsegna, dataEvasione);
    return days > 2;
  });
  return ordiniInRitardo;
};

module.exports.calculateOrdiniInRitardoMenoO2Giorni = (ordini) => {
  // Un ordine è considerato in ritardo se:
  // la data di evasione supera la data di prevista consegna
  const ordiniInRitardo = ordini.filter((ordine) => {
    const dataEvasione = moment(ordine.DataEvasione);
    const dataPrevConsegna = moment(ordine.DataPrevConsegna);
    const days = getWorkdayCount(dataPrevConsegna, dataEvasione);
    return days <= 2;
  });
  return ordiniInRitardo;
};

module.exports.calculatePuntualita = (ordiniInRitardo, ordini) => {
  // calcolo gli ordini puntuali
  if (ordini.length > 0) {
    return (1 - ordiniInRitardo.length / ordini.length).toFixed(2);
  }
  return 0;
};
