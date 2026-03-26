/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const moment = require('moment');
const config = require('../config').jobKpiTabelle;
const ImpiantiInduzioneService = require('../services/ImpiantiInduzioneService');
const { sendMail } = require('../lib/mailer');

const log = config.log();

const jobImpiantiIND = async (anno, mese) => {
  log.info(`Inizio il calcolo dei kpi di produzione per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const startTime = new Date();
  try {
    log.info(`Updating kpi di produzione per gli impianti di INDUZIONE for year=${anno} and month=${mese}`);
    // Gli impianti di Induzione seguono una logica diversa rispetto agli altri impianti
    await ImpiantiInduzioneService.calculateCapacitaTeorica(anno, mese);
    await ImpiantiInduzioneService.calculateOreAcceso(anno, mese);
    await ImpiantiInduzioneService.calculateMancanzaPersonale(anno, mese);
    await ImpiantiInduzioneService.calculateMancanzaMateriale(anno, mese);
    await ImpiantiInduzioneService.calculateOreFunzEffettivo(anno);
    await ImpiantiInduzioneService.calculateOreProduttive(anno, mese);

    await ImpiantiInduzioneService.calculatePerdite(anno, mese);
    await ImpiantiInduzioneService.calculateAltrePerdite(anno, mese);

    await ImpiantiInduzioneService.calculateEfficienzaProduttiva(anno, mese);
    await ImpiantiInduzioneService.calculateTassoQualita(anno, mese);
    await ImpiantiInduzioneService.calculateCapacitaPratica(anno, mese);

    await ImpiantiInduzioneService.calculateEquipmentAvailability(anno, mese);
    await ImpiantiInduzioneService.calculateSaturazioneCommerciale(anno, mese);
    await ImpiantiInduzioneService.calculateOEE(anno, mese);

    log.info(`Finish update kpi di produzione per gli impianti di INDUZIONE for year=${anno} and month=${mese}`);
  } catch (error) {
    log.error("Si è verificato un errore durante l'esecuzione del job impianti di INDUZIONE", error);
    const message = `Si è verificato un errore durante l'esecuzione del job impianti di INDUZIONE: ${error.stack}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - TS IMPIANTI INDUZIONE Job');
  }

  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail(`TUTTO OK PER ANNO ${anno} e MESE ${mese}`, '[OK] Sapere Temprasud - TS IMPIANTI INDUZIONE Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  // process.exit(0);
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

const run = async () => {
  const anno = moment().year();
  const mese = moment().month() + 1; // the range of the months is 0 to 11
  // elaboro trimestre precedente e mese in corso
  if (mese === 1) {
    await jobImpiantiIND(anno - 1, 10);
    await jobImpiantiIND(anno - 1, 11);
    await jobImpiantiIND(anno - 1, 12);
  } else if (mese === 2) {
    await jobImpiantiIND(anno - 1, 11);
    await jobImpiantiIND(anno - 1, 12);
    await jobImpiantiIND(anno, mese - 1);
  } else if (mese === 3) {
    await jobImpiantiIND(anno - 1, 12);
    await jobImpiantiIND(anno, mese - 2);
    await jobImpiantiIND(anno, mese - 1);
  } else {
    await jobImpiantiIND(anno, mese - 3);
    await jobImpiantiIND(anno, mese - 2);
    await jobImpiantiIND(anno, mese - 1);
  }
  await jobImpiantiIND(anno, mese);
};

run();
