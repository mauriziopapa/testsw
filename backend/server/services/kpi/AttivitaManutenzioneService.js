/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, buildMonthInterval } = require('../../lib/time');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const MAN_STRAO = 7;
const INT_REP = 8;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindowManStrao = [];
  const movingWindowIntRep = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { kpi_id } = filters;
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const target = await TargetService.getTarget(inputTarget, kpi_id);
  const monthInterval = buildMonthInterval(dal, al);
  let promises = monthInterval.map((month) => buildMonthData(month, target));
  const dataValues = await Promise.all(promises);

  // Imposta la data finale utilizzando il valore del filtro 'al'
  const ending = moment(al);

  // Loop attraverso gli elementi di 'tempo' a ritroso in modo da prendere sempre i 4 trimestri precedenti al valore corrente
  for (let i = monthInterval.length - 1; i >= 0; i--) {
    // Calcola l'offset in base all'indice corrente
    const offset = i;
    // Calcola il mese finale sottraendo l'offset dai mesi
    const endingMonth = ending.clone().subtract(offset, 'months');
    // Calcola il mese iniziale sottraendo 11 mesi dal mese finale
    const startingMonth = endingMonth.clone().subtract(11, 'months');
    // Costruisci un intervallo di mesi tra il mese iniziale e il mese finale
    const newTempo = buildMonthInterval(startingMonth, endingMonth);
    const kpiPromises = newTempo.map((month) => buildMonthData(month, target));
    const sommaInterventi = await Promise.all(kpiPromises);

    // Calcola la somma della manutenzione straordinaria e della Reperibilità Interventi
    const sumManStrao = sommaInterventi.reduce((sum, value) => sum + value.manStrao, 0);
    const sumIntRep = sommaInterventi.reduce((sum, value) => sum + value.intRep, 0);

    // Calcola la media mobile per entrambe le categorie
    const avgManStrao = sumManStrao > 0 ? sumManStrao / 12 : 0;
    const avgIntRep = sumIntRep > 0 ? sumIntRep / 12 : 0;

    // Aggiunge le medie mobili calcolate alle finestre mobili
    movingWindowManStrao.push(avgManStrao);
    movingWindowIntRep.push(avgIntRep);
  }

  // Assegna i valori medi calcolati alle rispettive proprietà degli oggetti in 'dataValues'
  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].averageManStrao = movingWindowManStrao[i].toFixed(2);
    dataValues[i].averageIntRep = movingWindowIntRep[i].toFixed(2);
  }

  dataValues.forEach((d) => {
    results.push(d);
  });

  return results;
};

async function buildMonthData(month, target) {
  const promises = [];
  promises.push(getKpi(MAN_STRAO, month.year, month.number));
  promises.push(getKpi(INT_REP, month.year, month.number));
  const results = await Promise.all(promises);

  const manStrao = results[0];
  const intRep = results[1];

  return {
    label: month.label,
    manStrao,
    intRep,
    target
  };
}

async function getKpi(kpi, anno, mese) {
  const sql = `
    SELECT  
    SUM(IFNULL(val,0)) AS val
    FROM kpi_manutenzione 
    WHERE kpi = :kpi AND anno = :anno AND mese = :mese`;

  const values = await dbBi.sequelizeBi.query(sql, {
    replacements: { kpi, anno, mese },
    type: QueryTypes.SELECT
  });

  return values[0].val ? values[0].val : 0;
}
