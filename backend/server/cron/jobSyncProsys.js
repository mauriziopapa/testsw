/* eslint-disable max-len */
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const config = require('../config').jobKpiTabelle;
const ImpiantiService = require('../services/ImpiantiService');
const ImpiantiAnagService = require('../services/ImpiantiAnagService');
const ProsysService = require('../services/ProsysService');
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');
const { FORMAT_DATE } = require('../lib/time');

const log = config.log();

const KPI_FUNZ_EFF = 30;

const jobSyncProsys = async (anno, mese) => {
  const startTime = new Date();
  try {
    log.info('Calcolo le ore di funzionamento effettivo per gli impianti dal Prosys');
    const anagraficaImpianti = await ImpiantiAnagService.findAll();
    const impianti = await getImpiantiProsys();
    const impiantiPromises = impianti.map((impianto) => calcolaOre(impianto, anno, mese, anagraficaImpianti));
    await Promise.all(impiantiPromises);
    await sendMail('TUTTO OK', '[OK] Sapere Temprasud - PROSYS Job');
    log.info('Finito di calcolare le ore di funzionamento effettivo per gli impianti dal Prosys');
  } catch (error) {
    log.error("Si è verificato un errore durante l'esecuzione del job sync Prosys", error);
    const message = `Si è verificato un errore durante l'esecuzione del job sync Prosys: ${error.stack}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - TS PROSYS Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
};

const calcolaOre = async (impianto, anno, mese, anagraficaImpianti) => {
  const ore = await ProsysService.getOreDiFunzionamento(impianto, anno, mese);

  const tempo = ore.reduce((partialSum, valore) => {
    let diff = 0;
    const oraInizio = moment(valore.Inizio);
    let oraFine = moment(valore.Fine);

    // Per gli impianti LLF vanno sottratti 50 minuti dalla fine del ciclo
    if (impianto.DescrizioneCentro.includes('LLF')) {
      oraFine = oraFine.subtract(45, 'minutes');
    }

    diff = oraFine.diff(oraInizio, 'hours', true);

    if (diff < 0) {
      log.warn(
        `Attenzione! Trovato valore negativo val=${diff}, impianto=${impianto.DescrizioneCentro}, anno=${anno}, mese=${mese}`
      );
      log.warn(
        `Info su oraInizio=${oraInizio.format(FORMAT_DATE)}, oraFine=${oraFine.format(FORMAT_DATE)}, 
        ciclo=${valore.Ciclo}, numeroCaricaImpianto=${valore.NumeroCaricaImpianto}, 
        idCaricaAggancio=${valore.IdCaricaAggancio}`
      );
    }

    return partialSum + diff;
  }, 0);

  const impiantoQwin = anagraficaImpianti.filter((anag) => anag.nome_impianto === impianto.DescrizioneCentro);

  if (impiantoQwin.length > 0) {
    log.info(
      `Aggiorno ore di funz effettivo (kpi=${KPI_FUNZ_EFF}) da PROSYS con val=${tempo}, impianto=${impianto.DescrizioneCentro}, anno=${anno}, mese=${mese}`
    );
    await ImpiantiService.updateImpiantiCrud(tempo.toFixed(2), anno, mese, impiantoQwin[0].id, KPI_FUNZ_EFF);
  }
};

const getImpiantiProsys = async () => {
  const sql = 'SELECT * FROM mapping_forni_prosys';

  const impianti = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return impianti;
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
    await jobSyncProsys(anno - 1, 10);
    await jobSyncProsys(anno - 1, 11);
    await jobSyncProsys(anno - 1, 12);
  } else if (mese === 2) {
    await jobSyncProsys(anno - 1, 11);
    await jobSyncProsys(anno - 1, 12);
    await jobSyncProsys(anno, mese - 1);
  } else if (mese === 3) {
    await jobSyncProsys(anno - 1, 12);
    await jobSyncProsys(anno, mese - 2);
    await jobSyncProsys(anno, mese - 1);
  } else {
    await jobSyncProsys(anno, mese - 3);
    await jobSyncProsys(anno, mese - 2);
    await jobSyncProsys(anno, mese - 1);
  }
  await jobSyncProsys(anno, mese);
};

run();
