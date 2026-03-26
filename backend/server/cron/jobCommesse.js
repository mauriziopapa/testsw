/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const config = require('../config').jobQWIN;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const Commessa = require('../models/bi/Commessa');

const log = config.log();

const BATCH_SIZE = 50;

const dateFieldConverter = (date) => {
  if (date != null) {
    return moment(new Date(date)).format('YYYY-MM-DD');
  }
  return null;
};

const jobDeleteCommesseDiba = async () => {
  const commesse = await selectCommesseToDelete();

  const commesseChunks = chunkArray(commesse, BATCH_SIZE);

  // Loop through each batch and call deleteCommesse
  for (let i = 0; i < commesseChunks.length; i += 1) {
    const chunk = commesseChunks[i];
    const numCommesse = chunk.map((c) => c['Numero Commessa']);
    await deleteCommesse(numCommesse);
  }
};

const selectCommesseToDelete = async () => {
  const query = `SELECT \`Numero Commessa\` 
                FROM commesse 
                WHERE \`Data Bolla\` between (CURDATE() - INTERVAL 2 month) and CURDATE()`;

  const kpi = await dbBi.sequelizeBi.query(query, { type: QueryTypes.SELECT });

  if (kpi.length === 0) {
    return [];
  }

  return kpi;
};

const deleteCommesse = async (commesse) => {
  const query = 'DELETE FROM commesse_diba WHERE `Numero Commessa` in (:commesse) ';

  await dbBi.sequelizeBi.query(query, {
    replacements: { commesse },
    type: QueryTypes.DELETE
  });
};

// Function to split the array into chunks
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const jobCommesse = async (anno) => {
  const startTime = new Date();

  try {
    const commesseQwin = await getCommesse(anno);
    const commesseSapere = commesseQwin.map((cQwin) => ({
      'Nome Cliente': cQwin.ClienteNome,
      'Codice Cliente': cQwin.ClienteBollaCodice,
      CommessaCliente: cQwin.CommessaCliente,
      Colata: cQwin.Colata,
      IDProdotto: cQwin.IDProdotto,
      CodiceProdotto: cQwin.CodiceProdotto,
      CodiceContratto: cQwin.IDContratto,
      'Data Bolla': dateFieldConverter(cQwin.DataBolla),
      DataCreazione: dateFieldConverter(cQwin.DataCreazione),
      DataChiusura: dateFieldConverter(cQwin.DataChiusura),
      DataRicMat: dateFieldConverter(cQwin.DataRicMat),
      DataConcordata: dateFieldConverter(cQwin.DataConcordata),
      DataEvasionePrevista: dateFieldConverter(cQwin.DataEvasionePrevista),
      'Data Operatore': dateFieldConverter(cQwin.DataOperatore),
      DestinazioneDiversa: cQwin.DestinazioneDiversa,
      'Descrizione Prodotto': cQwin.DescrizioneProdotto,
      FlagBlocco: cQwin.FlagBlocco,
      FlagNonConforme: cQwin.FlagNonConforme,
      'Flag Evasa': cQwin.FlagEvasa ? 'Y' : 'N',
      Materiale: cQwin.Materiale,
      NoteCliente: cQwin.Note,
      'Numero Bolla': cQwin.NumeroBolla,
      'Numero Commessa': cQwin.NumeroCommessa,
      NumNonConformita: cQwin.NumeroNonConformita,
      NumeroLotto: cQwin.NumeroLotto,
      NumeroOrdine: cQwin.NumeroOrdine,
      Peso: cQwin.Peso,
      PesoEvaso: cQwin.PesoEvaso,
      Pezzi: cQwin.Pezzi,
      PezziEvasi: cQwin.PezziEvasi,
      PrioritaCommessa: cQwin.PrioritaCommessa,
      QtaImballoEvasa: cQwin.QtaImballoEvasa,
      IDBolla: cQwin.IDBolla,
      IDRigaBolla: cQwin.IDRigaBolla,
      IDOperatore: cQwin.IDOperatore
    }));

    await Commessa.bulkCreate(commesseSapere, { updateOnDuplicate: ['Numero Commessa', 'CodiceContratto', 'Flag Evasa'] });
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK, elaborato anno=${anno}`, '[OK] Sapere Temprasud - QWIN Commesse Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job commesse: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Commesse Job');
  }
};

const getCommesse = async (anno) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/commesse?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&ddtDa=${anno}-01-01&ddtA=${anno}-12-31`
  );

  if (response && response.status === 200) {
    return response.data;
  }

  return [];
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
  await jobCommesse(anno);
  await jobDeleteCommesseDiba();
};

run();
