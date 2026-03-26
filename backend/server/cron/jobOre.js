/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const moment = require('moment');
const { Op } = require('sequelize');
const config = require('../config').jobOre;
const { sendMail } = require('../lib/mailer');

const log = config.log();

const { FORMAT_DATE } = require('../lib/time');
const { getToken, getOre, getFerieResidue } = require('../lib/http-tshr');
const OreTS = require('../models/bi/OreTS');

const { getCausali } = require('./causali');
const { updateKpiMalattia, updateKpiStraordinario, updateKpiOrdinario, updateKpiFerieResidue } = require('./kpiOre');

const PAGE = 200;
const UNITRAT = '0000000375';
const TEMPRASUD = '0000000102';

const jobOre = async () => {
  const startTime = new Date();
  try {
    // importo le ore da TS HR
    let accessToken = await getToken();
    log.info('Obtained access token!');
    const causali = await getCausali();
    for (let i = 0; i < causali.length; i += 1) {
      const causale = causali[i];
      await deleteLast4MonthsOre(causale);
      await loadOre(accessToken, causale);
    }
    log.info('Refreshing access token in order to loadOreFerieResidue');
    accessToken = await getToken();
    log.info('Obtained new access token!');
    await loadOreFerieResidue(accessToken, TEMPRASUD);

    // Aggiorno i kpi personale in base alle ore importate da TS HR
    await updateKpiMalattia(TEMPRASUD);
    await updateKpiStraordinario(TEMPRASUD);
    await updateKpiOrdinario(TEMPRASUD);
    await updateKpiFerieResidue(TEMPRASUD);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job ore: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - TS HR Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail('TUTTO OK', '[OK] Sapere Temprasud - TS HR Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  // process.exit(0);
};

const deleteLast4MonthsOre = async (causal) => {
  const { causale } = causal;
  log.info(`Started deleteLast4MonthsOre for causale=${causale}`);
  try {
    await OreTS.destroy({
      where: {
        causale,
        data: { [Op.gte]: moment().subtract(4, 'months').toDate() }
      }
    });
    log.info(`Finished deleteLast4MonthsOre for causale=${causale} with success`);
  } catch (error) {
    log.error(`Finished deleteLast4MonthsOre with error: ${error}`);
  }
};

const loadOre = async (accessToken, causale) => {
  const causal = causale.causale;
  log.info(`Started loadOre for causale=${causal}`);
  try {
    await loadOreAzienda(accessToken, UNITRAT, causal);
    await loadOreAzienda(accessToken, TEMPRASUD, causal);
    log.info(`Finished loadOre for causale=${causal} with success`);
  } catch (error) {
    log.error(`Finished loadOre with error: ${error}`);
  }
};

const loadOreAzienda = async (accessToken, azienda, causale) => {
  log.info(`Loading ore for azienda=${azienda} and causale=${causale}`);
  let finished = false;

  let offset = 0;
  while (!finished) {
    log.info(`Getting ore for ${azienda} from ${offset} with page limit=${PAGE}`);
    let results;
    try {
      results = await getOre(accessToken, causale, azienda, offset, PAGE);
    } catch (error) {
      log.error('Access token not valid! Refresh token...', error.message);
      // eslint-disable-next-line no-param-reassign
      accessToken = await getToken();
      log.info('Obtained new access token! Continue...');
      results = await getOre(accessToken, causale, azienda, offset, PAGE);
    }

    const promises = results.map((r) => upsert(r));
    await Promise.all(promises);

    if (results.length === 0) {
      finished = true;
      log.info('No more rows to elaborate.');
    } else {
      offset += results.length;
      log.info(`Found ${offset} rows, continue...`);
    }
  }

  log.info(`Finished loading ore for ${azienda} and causale=${causale}`);
};

const loadOreFerieResidue = async (accessToken, azienda) => {
  log.info(`Loading ore ferie residue for azienda=${azienda}`);
  let finished = false;

  let offset = 0;
  while (!finished) {
    log.info(`Getting ore ferie residue for ${azienda} from ${offset} with page limit=${PAGE}`);
    const results = await getFerieResidue(accessToken, azienda, offset, PAGE);

    const promises = results.map((r) => upsertFerie(r));
    await Promise.all(promises);

    if (results.length === 0) {
      finished = true;
      log.info('No more rows to elaborate.');
    } else {
      offset += results.length;
      log.info(`Found ${offset} rows, continue...`);
    }
  }

  log.info(`Finished loading ore ferie residue for ${azienda}`);
};

const upsert = async (ore) => {
  const oraTs = {
    ore: ore.ore / 3600, // per calcolare 8 ore
    azienda: ore.azienda,
    data: moment(ore.data, 'DD/MM/YYYY').format(FORMAT_DATE),
    causale: ore.causale,
    matricola: ore.matricola,
    tipo_assenza: ore.tipo_assenza
  };
  const where = {
    azienda: oraTs.azienda,
    data: moment(oraTs.data), // altrimenti non trova risultati perchè va un giorno indietro
    causale: oraTs.causale,
    matricola: oraTs.matricola,
    tipo_assenza: oraTs.tipo_assenza
  };

  const found = await OreTS.findOne({ where });
  if (found) {
    log.info(
      `Entry with ore=${oraTs.ore}, azienda=${oraTs.azienda}, data=${oraTs.data}, causale=${oraTs.causale}, matricola=${oraTs.matricola}, tipo_assenza=${oraTs.tipo_assenza} already exists. Updating it`
    );
    return OreTS.update({ ...oraTs }, { where: { id: found.id } });
  }

  log.info(
    `Entry with ore=${oraTs.ore}, azienda=${oraTs.azienda}, data=${oraTs.data}, causale=${oraTs.causale}, matricola=${oraTs.matricola}, tipo_assenza=${oraTs.tipo_assenza} doesn't exists. Creating it`
  );
  return OreTS.create(oraTs);
};

const upsertFerie = async (ore) => {
  const oraTs = {
    ore: ore.valore * 8, // le ferie sono espresse in giorni
    azienda: ore.azienda,
    data: moment(ore.data, 'DD/MM/YYYY').format(FORMAT_DATE),
    causale: ore.totale,
    matricola: ore.matricola,
    tipo_assenza: null
  };

  const where = {
    azienda: oraTs.azienda,
    data: moment(oraTs.data), // altrimenti non trova risultati perchè va un giorno indietro
    causale: oraTs.causale,
    matricola: oraTs.matricola,
    tipo_assenza: oraTs.tipo_assenza
  };

  const found = await OreTS.findOne({ where });
  if (found) {
    log.info(
      `Entry with ore=${oraTs.ore}, azienda=${oraTs.azienda}, data=${oraTs.data}, causale=${oraTs.causale}, matricola=${oraTs.matricola}, tipo_assenza=${oraTs.tipo_assenza} already exists. Updating it`
    );
    return OreTS.update({ ...oraTs }, { where });
  }

  log.info(
    `Entry with ore=${oraTs.ore}, azienda=${oraTs.azienda}, data=${oraTs.data}, causale=${oraTs.causale}, matricola=${oraTs.matricola}, tipo_assenza=${oraTs.tipo_assenza} doesn't exists. Creating it`
  );
  return OreTS.create(oraTs);
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

jobOre();
