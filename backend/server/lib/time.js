const moment = require('moment');

const buildDalAl = (from, to) => {
  const dal = `${from}-01`;
  const al = `${to}-28`;

  return { dal, al };
};

const buildMonthInterval = (from, to) => {
  const dateStart = moment(from);
  const dateEnd = moment(to);
  const interim = dateStart.clone();
  const timeValues = [];

  while (dateEnd > interim || interim.format('M') === dateEnd.format('M')) {
    const obj = {
      year: interim.format('YYYY'),
      number: interim.format('MM'),
      label: getMonthFromNumber(interim.month() + 1),
      from: interim.startOf('month').format('YYYY-MM-DD'),
      to: interim.endOf('month').format('YYYY-MM-DD')
    };
    timeValues.push(obj);
    interim.add(1, 'month');
  }

  return timeValues;
};

const getMonthFromNumber = (number) => {
  switch (number) {
    case 1:
      return 'Gennaio';
    case 2:
      return 'Febbraio';
    case 3:
      return 'Marzo';
    case 4:
      return 'Aprile';
    case 5:
      return 'Maggio';
    case 6:
      return 'Giugno';
    case 7:
      return 'Luglio';
    case 8:
      return 'Agosto';
    case 9:
      return 'Settembre';
    case 10:
      return 'Ottobre';
    case 11:
      return 'Novembre';
    case 12:
      return 'Dicembre';
    default:
      return '';
  }
};

const getMonthIntervalFromTrimestre = (trimestre, anno) => {
  let from = `${anno}-01-01`;
  let to = `${anno}-12-31`;
  switch (trimestre) {
    case 'I TRI':
      from = `${anno}-01-01`;
      to = `${anno}-03-31`;
      break;
    case 'II TRI':
      from = `${anno}-04-01`;
      to = `${anno}-06-30`;
      break;
    case 'III TRI':
      from = `${anno}-07-01`;
      to = `${anno}-09-30`;
      break;
    case 'IV TRI':
      from = `${anno}-10-01`;
      to = `${anno}-12-31`;
      break;
    default:
      return '';
  }
  return { from, to };
};

const getMonthNumbersFromTrimestre = (trimestre) => {
  let months = [];
  switch (trimestre) {
    case 'I TRI':
      months = [1, 2, 3];
      break;
    case 'II TRI':
      months = [4, 5, 6];
      break;
    case 'III TRI':
      months = [7, 8, 9];
      break;
    case 'IV TRI':
      months = [10, 11, 12];
      break;
    default:
      return '';
  }
  return months;
};

const isBeforeYear = (fromYear, yearToCheck) => {
  const data = moment(fromYear);
  const dataToCheck = moment(yearToCheck);
  return data.isBefore(dataToCheck);
};

const isBetween = (fromYear, toYear, yearToCheck) => {
  const dataFrom = moment(fromYear);
  const dataTo = moment(toYear);
  const dataToCheck = moment(yearToCheck);
  return dataToCheck.isBetween(dataFrom, dataTo);
};

const buildAnni = (dal, al) => {
  const anni = [];
  for (let i = dal; i <= al; i += 1) {
    anni.push(i);
  }
  return anni;
};

const FORMAT_DATE = 'YYYY-MM-DD';
const FORMAT_DATE_MONTH = 'YYYY-MM';
const FORMAT_DATEMONTH = 'YYYYMM';

module.exports.buildDalAl = buildDalAl;
module.exports.buildMonthInterval = buildMonthInterval;
module.exports.getMonthFromNumber = getMonthFromNumber;
module.exports.getMonthIntervalFromTrimestre = getMonthIntervalFromTrimestre;
module.exports.getMonthNumbersFromTrimestre = getMonthNumbersFromTrimestre;
module.exports.isBeforeYear = isBeforeYear;
module.exports.isBetween = isBetween;
module.exports.buildAnni = buildAnni;
module.exports.FORMAT_DATE = FORMAT_DATE;
module.exports.FORMAT_DATE_MONTH = FORMAT_DATE_MONTH;
module.exports.FORMAT_DATEMONTH = FORMAT_DATEMONTH;
