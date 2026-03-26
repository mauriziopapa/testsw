/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const { Op } = require('sequelize');
const axios = require('axios');
const config = require('../config').jobQWIN;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const TimbrateNC = require('../models/bi/TimbrateNC');

const log = config.log();

const jobTimbrateNC = async (commesseNC, anno) => {
  const transaction = await dbBi.sequelizeBi.transaction();
  const startTime = new Date();

  try {
    const allMovimenti = [];

    for (let i = 0; i < commesseNC.length; i += 1) {
      const commessa = commesseNC[i];
      const movimenti = await getMovimentiCommessaFromQWIN(commessa.anno, commessa.numero);
      allMovimenti.push(...movimenti);
    }

    // Mapping e filtering
    const processedMovimenti = processMovimentiData(allMovimenti);

    const resultInsert = await insertMovimentiToDb(processedMovimenti, anno, transaction);

    log.info(`inserted/updated ${resultInsert.length} records`);

    // Commit the transaction
    await transaction.commit();
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);

    await sendMail(
      `TUTTO OK, elaborate ${commesseNC.length} commesse NC. Inseriti/Aggiornati ${resultInsert.length} record.`,
      '[OK] Sapere Temprasud - QWIN Timbrate NC Job'
    );

    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    // If any error occurred, roll back the transaction
    await transaction.rollback();
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job jobMovimentiCommessaNC: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Timbrate NC Job');
  }
};

/**
 * Recupera le commesse NC dal database per l'anno specificato
 * @param {number} anno - L'anno per cui recuperare le commesse NC
 * @returns {Promise<Array>} Array di oggetti con anno e numero delle commesse NC
 */
const getCommesseNCFromDb = async (anno) => {
  try {
    const results = await dbBi.sequelizeBi.query(
      'SELECT AnnoNC as anno, NumeroNC as numero FROM commesse_nc WHERE AnnoNC >= ?',
      {
        replacements: [anno],
        type: dbBi.sequelizeBi.QueryTypes.SELECT
      }
    );

    log.info(`Found ${results.length} commesse NC for year ${anno}`);
    return results;
  } catch (error) {
    log.error(`Error fetching commesse NC from DB: ${error.message}`);
    throw error;
  }
};

/**
 * Recupera i movimenti commessa da QWIN API per una specifica commessa NC
 * @param {number} anno - Anno della commessa NC
 * @param {string} numero - Numero della commessa NC
 * @returns {Promise<Array>} Array dei movimenti commessa
 */
const getMovimentiCommessaFromQWIN = async (anno, numero) => {
  try {
    const url = `http://10.64.21.250:18666/api/exportdati/commesse/movimenti?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&annoNC=${anno}&numeroNC=${numero}`;

    const response = await axios.get(url);

    if (response && response.status === 200) {
      log.info(`Retrieved ${response.data.length} movimenti for NC ${anno}/${numero}`);
      return response.data;
    }

    log.warn(`No data returned for NC ${anno}/${numero}`);
    return [];
  } catch (error) {
    log.error(`Error fetching movimenti for NC ${anno}/${numero}: ${error.message}`);
    throw error;
  }
};

/**
 * Processa e mappa i dati dei movimenti secondo il mapping JSON specificato
 * e applica i filtri richiesti sui dati già trasformati
 * @param {Array} rawMovimenti - Dati grezzi dei movimenti
 * @returns {Array} Dati processati e filtrati pronti per l'inserimento
 */
const processMovimentiData = (rawMovimenti) => {
  log.info(`Processing ${rawMovimenti.length} raw movimenti`);

  // Prima fase: Mapping dei dati grezzi
  const mappedMovimenti = rawMovimenti.map((item) => ({
    // Mapping basato sulla tabella JSON fornita
    IDMovCommessa: item.IDMovCommessa,
    NumeroCommessa: item.NumeroCommessa,
    SottoCommessa: item.SottoCommessa,
    AnnoNC: item.NonConformita?.AnnoNC || null,
    NumeroNC: item.NonConformita?.NumeroNC || null,
    TipoNC: item.NonConformita?.TipoNC || null,
    CausaNC: item.NonConformita?.CausaNC || null,
    IDLavorazione: item.IDLavorazione,
    Peso: item.Peso,
    Pezzi: item.Pezzi,
    CodiceReparto: item.NonConformita?.CodiceReparto || null,
    IDAzione: item.NonConformita?.IDAzione || null,
    DescNC: item.NonConformita?.DescNC || null,
    DataNC: item.NonConformita?.DataNC || null,
    Carica: item.NonConformita?.Carica || null,
    IDAzioneNC: item.AzioniNonConformita?.IDAzioneNC || null,
    DescrAzioneNC: item.AzioniNonConformita?.DescrAzioneNC || null,
    CodiceAzioneNC: item.AzioniNonConformita?.CodiceAzioneNC || null
  }));

  log.info(`Mapped ${mappedMovimenti.length} movimenti`);

  // Seconda fase: Applicazione dei filtri sui dati già mappati
  const filteredMovimenti = mappedMovimenti.filter((item) => {
    // Condizioni di filtro basate sui campi già trasformati:
    // IDMovCommessa IS NOT NULL
    // AND NumeroCommessa IS NOT NULL
    // AND AnnoNC IS NOT NULL
    // AND NumeroNC IS NOT NULL
    const hasIDMovCommessa = item.IDMovCommessa != null && item.IDMovCommessa !== '';
    const hasNumeroCommessa = item.NumeroCommessa != null && item.NumeroCommessa !== '';
    const hasAnnoNC = item.AnnoNC != null && item.AnnoNC !== '';
    const hasNumeroNC = item.NumeroNC != null && item.NumeroNC !== '';

    // Tutte le condizioni devono essere soddisfatte (AND)
    return hasIDMovCommessa && hasNumeroCommessa && hasAnnoNC && hasNumeroNC;
  });

  log.info(`Filtered from ${mappedMovimenti.length} to ${filteredMovimenti.length} movimenti`);
  log.info(`Successfully processed and filtered ${filteredMovimenti.length} movimenti`);

  return filteredMovimenti;
};

/**
 * Cancella tutti i record di timbrate_nc con AnnoNC >= anno
 * @param {Object} transaction - Transazione Sequelize
 * @returns {Promise<number>} Numero di record cancellati
 */
const deleteExistingTimbrateNC = async (anno, transaction) => {
  log.info(`Deleting existing timbrate_nc records with AnnoNC >= ${anno}`);

  try {
    const deletedCount = await TimbrateNC.destroy({
      where: {
        AnnoNC: {
          [Op.gte]: anno // Greater than or equal to
        }
      },
      transaction,
      logging: (sql) => log.debug(`DELETE SQL Query: ${sql}`)
    });

    log.info(`Successfully deleted ${deletedCount} existing records from timbrate_nc table`);
    return deletedCount;
  } catch (error) {
    log.error(`Error during delete operation: ${error.message}`);
    log.error('Delete error details:', error);
    throw error;
  }
};

/**
 * Inserisce le timbrate nel database utilizzando bulk insert
 * @param {Array} processedMovimenti - Movimenti processati
 * @param {Object} transaction - Transazione Sequelize
 * @returns {Promise<Array>} Risultati dell'inserimento
 */
const insertMovimentiToDb = async (processedMovimenti, anno, transaction) => {
  log.info(`Inserting ${processedMovimenti.length} processed timbrate`);

  if (processedMovimenti.length === 0) {
    log.info('No timbrate to insert');
    return [];
  }

  try {
    // Prima cancella i record esistenti
    await deleteExistingTimbrateNC(anno, transaction);

    // Poi esegue il bulk insert
    const resultInsert = await TimbrateNC.bulkCreate(processedMovimenti, {
      transaction,
      validate: true,
      logging: (sql) => log.debug(`INSERT SQL Query: ${sql}`)
    });

    log.info(`Successfully inserted ${resultInsert.length} records in timbrate_nc table`);
    log.info(`Records processed: ${processedMovimenti.length}, Database operations completed.`);

    return resultInsert;
  } catch (error) {
    log.error(`Error during insert operation: ${error.message}`);
    log.error('Error details:', error);

    // Log dei primi record che hanno causato errore per debugging
    if (processedMovimenti.length > 0) {
      log.error('Sample of data causing error:', JSON.stringify(processedMovimenti.slice(0, 3), null, 2));
    }

    throw error;
  }
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

const run = async () => {
  try {
    // Recupera le commesse NC dal database (anno >= curr year -1)
    const anno = new Date().getFullYear() - 1;
    const commesseNC = await getCommesseNCFromDb(anno);

    if (commesseNC.length === 0) {
      log.info('No commesse NC found for processing');
      return;
    }

    // Processa tutte le commesse NC trovate
    await jobTimbrateNC(commesseNC, anno);
  } catch (error) {
    log.error(`Error in run function: ${error.message}`);
    const message = `Errore generale nell'esecuzione del job: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Timbrate NC Job - Run Error');
  }
};

run();
