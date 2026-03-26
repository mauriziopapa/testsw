/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const config = require('../config').jobKpiTabelle;
const ImpiantiService = require('../services/ImpiantiService');
const ImpiantiAnagService = require('../services/ImpiantiAnagService');

const BIConstants = require('../models/bi/BIConstants');

const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const log = config.log();

const jobImpianti = async (anno, mese) => {
  log.info(`Inizio il calcolo dei kpi di produzione per gli impianti di per anno=${anno} e mese=${mese}`);
  const startTime = new Date();
  try {
    log.info('Updating kpi di produzione per gli impianti');
    const gruppiImpianti = await getGruppiImpianti();
    // Gli impianti di INDUZIONE vengono aggiornati da un altro job
    const gruppiPromises = gruppiImpianti
      .filter((impianto) => impianto.gruppo_impianto !== BIConstants.IND.label)
      .map((gruppo) => calcolaKpi(gruppo, anno, mese));
    await Promise.all(gruppiPromises);
    log.info('Finish update kpi di produzione per gli impianti');
  } catch (error) {
    log.error("Si è verificato un errore durante l'esecuzione del job impianti", error);
    const message = `Si è verificato un errore durante l'esecuzione del job impianti: ${error.stack}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - TS IMPIANTI Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail(`TUTTO OK PER ANNO ${anno} e MESE ${mese}`, '[OK] Sapere Temprasud - TS IMPIANTI Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  // process.exit(0);
};

const calcolaKpi = async (gruppo, anno, mese) => {
  log.info(`Calcolo i kpi numerici per il gruppo di impianti ${gruppo.gruppo_impianto}, anno=${anno}, mese=${mese}`);
  const impianti = await ImpiantiAnagService.findAllByGruppo(gruppo.gruppo_impianto);
  const kpiCalcolati = await getKpi('impianti', true, 'number');
  const kpiNonCalcolati = await getKpi('impianti', false, 'number');
  const sommePromises = kpiNonCalcolati.map((kpi) => getSommaKpi(kpi, impianti, anno, mese));
  const somme = await Promise.all(sommePromises);

  const updatePromises = kpiCalcolati.map((kpi) => updateKpi(kpi, gruppo.gruppo_impianto, somme, anno, mese));
  const update = await Promise.all(updatePromises);
  log.info(
    `Finito di calcolare i kpi numerici per il gruppo di impianti ${gruppo.gruppo_impianto}, anno=${anno}, mese=${mese}`
  );

  log.info(`Calcolo i kpi percentuali per il gruppo di impianti ${gruppo.gruppo_impianto}, anno=${anno}, mese=${mese}`);
  const kpiCalcolatiPerc = await getKpi('impianti', true, 'perc');
  const sommeCalcPercPromises = kpiCalcolatiPerc.map((kpi) =>
    getSommaKpiCalcolati(kpi, gruppo.gruppo_impianto, anno, mese)
  );
  const sommeCalcPerc = await Promise.all(sommeCalcPercPromises);
  const updatePercPromises = kpiCalcolatiPerc.map((kpi) =>
    updateKpi(kpi, gruppo.gruppo_impianto, sommeCalcPerc.concat(somme), anno, mese)
  );
  await Promise.all(updatePercPromises);
  log.info(
    `Finito di calcolare i kpi percentuali per il gruppo di impianti ${gruppo.gruppo_impianto}, anno=${anno}, mese=${mese}`
  );

  return update;
};

const updateKpi = async (kpi, reparto, somme, anno, mese) => {
  log.info(
    `Calcolo il kpi=${kpi.id} - (${kpi.nome_kpi}) per il gruppo di impianti ${reparto}, anno=${anno}, mese=${mese}`
  );
  let val = 0;
  switch (kpi.id) {
    case 14:
      val = ImpiantiService.calculateOreAcceso(somme);
      break;
    case 24:
      val = ImpiantiService.calculateOreFunzEffettivoDiControllo(somme);
      break;
    case 27:
      val = ImpiantiService.calculateOreProduttive(somme);
      break;
    case 15:
      val = ImpiantiService.calculateOEE(somme);
      break;
    case 28:
      val = ImpiantiService.calculateCapacitaPratica(somme);
      break;
    case 1:
      val = ImpiantiService.calculateEfficienzaProduttiva(somme);
      break;
    case 29:
      val = ImpiantiService.calculateTassoQualita(somme);
      break;
    case 3:
      val = ImpiantiService.calculateEquipAvail(somme);
      break;
    case 33:
      val = ImpiantiService.calculateEfficaciaManutenzione(somme);
      break;
    case 4:
      val = ImpiantiService.calculateSaturazioneCommerciale(somme);
      break;
    default:
      break;
  }
  log.info(
    `Aggiorno il kpi=${kpi.id} - (${kpi.nome_kpi}) per il gruppo di impianti ${reparto}, anno=${anno}, mese=${mese} col valore=${val}`
  );
  if (!Number.isNaN(val)) {
    await ImpiantiService.updateKpiProduzione(val, anno, mese, reparto, kpi.id);
  } else {
    log.info(
      `Non ho aggiornato il kpi=${kpi.id} - (${kpi.nome_kpi}) per il gruppo di impianti ${reparto}, anno=${anno}, mese=${mese} col valore=${val}`
    );
  }
};

const getSommaKpi = async (kpi, impianti, anno, mese) => {
  const valoriPromises = impianti.map((impianto) => ImpiantiService.getValoriImpianto(anno, mese, impianto.id, kpi.id));
  const valoriKpi = await Promise.all(valoriPromises);
  const somma = valoriKpi.reduce((partialSum, valore) => partialSum + valore, 0);
  return { kpi_id: kpi.id, kpi_nome: kpi.nome_kpi, somma };
};

const getSommaKpiCalcolati = async (kpi, reparto, anno, mese) => {
  const valoriKpi = await ImpiantiService.getValoriKpiProduzione(anno, mese, reparto, kpi.id);
  const somma = valoriKpi || 0;
  return { kpi_id: kpi.id, kpi_nome: kpi.nome_kpi, somma };
};

const getKpi = async (crud, calcolato, format) => {
  const sql = `
  SELECT
    *
  FROM
    kpi
  WHERE
    crud = :crud
    AND calcolato = :calcolato
    AND format = :format
  ORDER BY
    ordine ASC`;

  const kpis = await dbBi.sequelizeBi.query(sql, {
    replacements: { crud, calcolato, format },
    type: QueryTypes.SELECT
  });

  return kpis;
};

const getGruppiImpianti = async () => {
  const sql = 'SELECT DISTINCT gruppo_impianto FROM impianti_anag';

  const gruppi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return gruppi;
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
    await jobImpianti(anno - 1, 10);
    await jobImpianti(anno - 1, 11);
    await jobImpianti(anno - 1, 12);
  } else if (mese === 2) {
    await jobImpianti(anno - 1, 11);
    await jobImpianti(anno - 1, 12);
    await jobImpianti(anno, mese - 1);
  } else if (mese === 3) {
    await jobImpianti(anno - 1, 12);
    await jobImpianti(anno, mese - 2);
    await jobImpianti(anno, mese - 1);
  } else {
    await jobImpianti(anno, mese - 3);
    await jobImpianti(anno, mese - 2);
    await jobImpianti(anno, mese - 1);
  }
  await jobImpianti(anno, mese);
};

run();
