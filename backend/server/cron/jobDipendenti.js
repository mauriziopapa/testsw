/* eslint-disable no-await-in-loop */
const moment = require('moment');
const config = require('../config').jobDipendenti;
const { sendMail } = require('../lib/mailer');

const log = config.log();

const { FORMAT_DATE } = require('../lib/time');
const { getToken, getDipendenti } = require('../lib/http-tshr');
const DipendentiTSService = require('../services/DipendentiTSService');
const { updateKpiNumDipendenti } = require('./kpiDipendenti');

const PAGE = 200;
const UNITRAT = '0000000375';
const TEMPRASUD = '0000000102';

const jobDipendenti = async () => {
  const startTime = new Date();
  try {
    // importo le ore da TS HR
    const accessToken = await getToken();
    log.info('Obtained access token!');

    const dipendenti = await loadDipendenti(accessToken);

    const dipendentiTs = dipendenti.map((dipendente) => ({
      matricola: dipendente.matricola,
      azienda: dipendente.azienda,
      reparto: dipendente.ca17,
      licenziamento: dipendente.licenziamento
        ? moment(dipendente.licenziamento, 'DD/MM/YYYY').format(FORMAT_DATE)
        : null
    }));

    const results = await DipendentiTSService.upsertAll(dipendentiTs);
    const updated = results.filter((r) => !r[1]);
    log.info(`Upsert dipendenti, updated ${updated.length}, created ${results.length - updated.length}`);
    // Aggiorno il numero di dipendenti per Temprasud
    await updateKpiNumDipendenti(TEMPRASUD);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job dipendenti: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - TS DIPENDENTI Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail('TUTTO OK', '[OK] Sapere Temprasud - TS DIPENDENTI Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  // process.exit(0);
};

const loadDipendenti = async (accessToken) => {
  log.info('Started loadDipendenti');
  try {
    const dipendenti = await loadDipendentiAziende(accessToken);
    log.info(`Finished loadDipendenti for ${dipendenti.length} dipendenti with success`);
    return dipendenti;
  } catch (error) {
    log.error(`Finished loadDipendenti with error: ${error}`, error);
    return [];
  }
};

const loadDipendentiAziende = async (accessToken) => {
  log.info('Loading dipendenti');
  let finished = false;
  let dipendenti = [];

  let offset = 0;
  while (!finished) {
    log.info(`Getting dipendenti from ${offset} with page limit=${PAGE}`);
    const results = await getDipendenti(accessToken, offset, PAGE);

    if (results.length === 0) {
      finished = true;
      log.info('No more rows to elaborate.');
    } else {
      offset += results.length;
      log.info(`Found ${offset} rows, continue...`);
    }

    dipendenti = dipendenti.concat(results);
  }

  log.info('Finished loading dipendenti');
  return dipendenti;
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

jobDipendenti();
