/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const RITARDO = 'RITARDO';
const PROGRAMMATA = 'PROGRAMMATA';
const TOT = 'TOT';
const PREDITTIVA = 'PREDITTIVA';

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindowProg = [];
  const movingWindowPred = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target;
  const { kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [tempo, target] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildData(t, target));
  const dataValues = await Promise.all(dataPromises);

  const ending = moment(al);

  // Loop attraverso gli elementi di 'tempo' a ritroso in modo da prendere sempre i 4 trimestri precedenti al valore corrente
  for (let i = tempo.length - 1; i >= 0; i--) {
    // Calcola l'offset in base all'indice corrente
    const offset = i * 3;
    // Calcola il mese finale sottraendo l'offset dai mesi
    const endingMonth = ending.clone().subtract(offset, 'months');
    // Calcola il mese iniziale sottraendo 9 mesi dal mese finale
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    // Ottieni i nuovi dati 'tempo' per il range di mesi calcolato (4 trimestri precedenti)
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );

    // Ottiene i KPI per ritardo programmata, ritardo predittiva, totale predittiva e totale programmata
    const [dataProgRit, dataPredRit, dataPredTot, dataProgTot] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpi(t, RITARDO, PROGRAMMATA))),
      Promise.all(newTempo.map((t) => getKpi(t, RITARDO, PREDITTIVA))),
      Promise.all(newTempo.map((t) => getKpi(t, TOT, PREDITTIVA))),
      Promise.all(newTempo.map((t) => getKpi(t, TOT, PROGRAMMATA)))
    ]);

    // Calcola la media mobile per la manutenzione predittiva
    const calcPred = dataPredRit.map((currElement, index) =>
      dataPredTot[index] > 0 ? currElement / dataPredTot[index] : 0
    );
    const sumPred = calcPred.reduce((sum, value) => sum + value, 0);
    const avgPred = sumPred >= 0 ? (sumPred * 100) / calcPred.length : 0;

    // Calcola la media mobile per la manutenzione programmata
    const calcProg = dataProgRit.map((currElement, index) =>
      dataProgTot[index] > 0 ? currElement / dataProgTot[index] : 0
    );
    const sumProg = calcProg.reduce((sum, value) => sum + value, 0);
    const avgProg = sumProg >= 0 ? (sumProg * 100) / calcProg.length : 0;

    // Aggiunge i valori calcolati alle finestre mobili
    movingWindowProg.push(avgProg);
    movingWindowPred.push(avgPred);
  }

  // Assegna i valori medi calcolati alle rispettive proprietà degli oggetti in 'dataValues'
  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].programmataMovingAverage = movingWindowProg[i].toFixed(2);
    dataValues[i].predittivaMovingAverage = movingWindowPred[i].toFixed(2);
  }

  dataValues.forEach((d) => {
    results.push(d);
  });

  return results;
};

async function buildData(row, target) {
  const promises = [];
  // prendo le ore in ritardo della manutenzione programmata
  promises.push(getKpi(row, RITARDO, PROGRAMMATA));
  // prendo le ore totali della programmata
  promises.push(getKpi(row, TOT, PROGRAMMATA));
  // prendo le ore in ritardo della manutenzione predittiva
  promises.push(getKpi(row, RITARDO, PREDITTIVA));
  // prendo le ore totali della predittiva
  promises.push(getKpi(row, TOT, PREDITTIVA));
  const data = await Promise.all(promises);

  const manutenzione_prog_rit = data[0];
  const manutenzione_prog_tot = data[1];
  const manutenzione_pred_rit = data[2];
  const manutenzione_pred_tot = data[3];

  const programmata = (manutenzione_prog_rit / manutenzione_prog_tot) * 100;
  const predittiva = (manutenzione_pred_rit / manutenzione_pred_tot) * 100;

  return {
    label: row.label,
    programmata: parseFloat(programmata.toFixed(2)),
    predittiva: parseFloat(predittiva.toFixed(2)),
    manutenzione_prog_rit,
    manutenzione_prog_tot,
    manutenzione_pred_rit,
    manutenzione_pred_tot,
    target
  };
}

async function getKpi(row, tipologia, foglio) {
  const mesi = getMesiFromTrimestre(row.trimestre);
  const query_kpi = `
  SELECT SUM(ifnull(val, 0)) as somma
  FROM excel_manutenzione_girata
  WHERE 
  tipologia = :tipologia AND foglio = :foglio AND 
  anno = :anno AND mese in (:mesi)
  `;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: {
      anno: row.anno,
      mesi,
      tipologia,
      foglio
    },
    type: QueryTypes.SELECT
  });
  return kpi[0].somma ? kpi[0].somma : 0;
}

function getMesiFromTrimestre(trimestre) {
  switch (trimestre) {
    case 'I TRI':
      return [1, 2, 3];
    case 'II TRI':
      return [4, 5, 6];
    case 'III TRI':
      return [7, 8, 9];
    case 'IV TRI':
      return [10, 11, 12];
    default:
      return [];
  }
}
