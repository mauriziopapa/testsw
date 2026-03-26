/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const moment = require('moment');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const CostoNonQualitaService = require('./CostoNonQualitaService');
const ValueGroup = require('../../models/response/ValueGroup');
const Value = require('../../models/response/Value');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const NC_MANUTENZIONE = 15;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const kpiId = filters.kpi_id;

  const [tempo, target] = await Promise.all([
    TempoMesiService.getTempo(dal, al),
    TargetService.getTarget(inputTarget, kpiId)
  ]);

  const dataPromises = tempo.map((t) => buildData(t.trimestre, t.anno, t, target));
  const dataValues = await Promise.all(dataPromises);

  // Imposta la data finale utilizzando il valore del filtro 'al'
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
    // Crea una promessa per ottenere i KPI di costo per ciascun trimestre nel nuovo intervallo di tempo
    const kpiPromises = newTempo.map((t) => CostoNonQualitaService.getKpiSummTrimestre(t, NC_MANUTENZIONE));
    const sommaCostiTrimestre = await Promise.all(kpiPromises);
    // Calcola la somma totale dei costi per il trimestre
    const totalSum = sommaCostiTrimestre.reduce((sum, value) => sum + value, 0);

    // Calcola la media mobile dei costi trimestrali
    const average = sommaCostiTrimestre.length > 0 ? totalSum / sommaCostiTrimestre.length : 0;

    // Aggiungi la media calcolata alla finestra mobile
    movingWindow.push(average);
  }

  // Assegna i valori medi calcolati alle rispettive proprietà degli oggetti in 'dataValues'
  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].valori.push(new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build());
  }

  dataValues.forEach((d) => {
    results.push(d);
  });
  return results;
};

async function buildData(trimestre, anno, row, target) {
  const val = await CostoNonQualitaService.getCostoNC(anno, trimestre, NC_MANUTENZIONE);
  const value = new Value.Builder().setLabel('Val').setData(val).build();
  return new ValueGroup.Builder().setLabel(row.label).setValori([value]).setTarget(target).build();
}
