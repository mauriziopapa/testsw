/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const { Op } = require('sequelize');
const axios = require('axios');
const moment = require('moment');
const config = require('../config').jobQWIN;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const RegistroInduzione = require('../models/bi/RegistroInduzione');

const log = config.log();

const jobRegistroInduzione = async (from, to) => {
  const transaction = await dbBi.sequelizeBi.transaction();

  const startTime = new Date();

  try {
    // First delete rows within the date range and then reinsert them
    /*
    await RegistroInduzione.destroy({
      where: {
        GiornoLavorazione: {
          [Op.between]: [from, to]
        }
      },
      transaction
    });*/

    const registroInduzione = await getRegistroInduzione(from, to);
    const toInsert = registroInduzione.map((item) => {
      let giornoCompilazioneFormatted = null;
      if (item.GiornoCompilazione != null) {
        const oraCompilazioneArr = item.GiornoCompilazione.split('T');
        const giornoCompilazione = oraCompilazioneArr[0];
        giornoCompilazioneFormatted = `${giornoCompilazione}`;
      }

      let giornoLavorazioneFormatted = null;
      if (item.GiornoLavorazione != null) {
        const oraLavorazioneArr = item.GiornoLavorazione.split('T');
        const giornoLavorazione = oraLavorazioneArr[0];
        giornoLavorazioneFormatted = `${giornoLavorazione}`;
      }

      return {
        IDInduzione: item.IDInduzione,
        NumeroCommessa: item.NumeroCommessa,
        IDOperatore: item.IDOperatore,
        GiornoLavorazione: giornoLavorazioneFormatted,
        GiornoCompilazione: giornoCompilazioneFormatted,
        OreTotaliLavorate: item.OreTotaliLavorate,
        PezziLavorati: item.PezziLavorati,
        PezziScarto: item.PezziScarto,
        PezziControllo: item.PezziControllo,
        TempoSetup: item.TempoSetup,
        TempoMessaAPunto: item.TempoMessaAPunto,
        TempoGuasto: item.TempoGuasto,
        TempoCostruzioneInduttore: item.TempoCostruzioneInduttore,
        TempoRitardoLaboratorio: item.TempoRitardoLaboratorio,
        TempoAssenzaEnergia: item.TempoAssenzaEnergia,
        TempoManutenzioneOrdinaria: item.TempoManutenzioneOrdinaria,
        TempoFormazione: item.TempoFormazione,
        TempoAltreAttivita: item.TempoAltreAttivita,
        TempoPulizia: item.TempoPulizia,
        TempoProtezioni: item.TempoProtezioni,
        TempoControlliCricche: item.TempoControlliCricche,
        conversione_effettuata: 0
      };
    });

    const resultInsert = await RegistroInduzione.bulkCreate(toInsert, { transaction });
    // Commit the transaction
    await transaction.commit();
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK, elaborato from=${from}, to=${to}`, '[OK] Sapere Temprasud - QWIN Registro Induzione Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    // If any error occurred, roll back the transaction
    // await transaction.rollback();
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job jobRegistroInduzione: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Registro Induzione Job');
  }
  // process.exit(0);
};

const getRegistroInduzione = async (from, to) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/commesse/induzioneregistro?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da=${from}&a=${to}`
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
  const now = moment();
  const previousMonth = moment().subtract(1, 'M');

  const from = now.startOf('month').format('YYYY-MM-DD');
  const to = now.endOf('month').format('YYYY-MM-DD');
  await jobRegistroInduzione('2024-01-01', '2024-12-31');
  /*
  const fromPrev = previousMonth.startOf('month').format('YYYY-MM-DD');
  const toPrev = previousMonth.add(1, 'M').startOf('month').format('YYYY-MM-DD');
  await jobRegistroInduzione(fromPrev, toPrev);
  */
};

run();
