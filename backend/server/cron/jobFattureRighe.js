/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');

const config = require('../config').jobFatture;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const FattureTestate = require('../models/bi/FattureTestate');
const FattureRighe = require('../models/bi/FattureRighe');

const log = config.log();

const jobFattureRighe = async (anno) => {
  const startTime = new Date();

  try {
    const fatture = await FattureTestate.findAll({
      where: {
        DataFattura: dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('DataFattura')), anno)
      }
    });

    for (let i = 0; i < fatture.length; i += 1) {
      const fattura = fatture[i];
      const fattureRighe = await getFattureRighe(fattura.AnnoFattura, fattura.NumeroFattura);

      const righe = fattureRighe.map((riga) => ({
        AnnoFattura: riga.AnnoFattura,
        mese_num: fattura.DataFattura.getMonth() + 1,
        NumeroFattura: riga.NumeroFattura,
        SerieFattura: riga.SerieFattura,
        NrRiga: riga.NrRiga,
        CodiceArticolo: riga.CodiceArticolo,
        DescrizioneArticolo: riga.DescrizioneArticolo,
        Um: riga.Um,
        Quantita: riga.Quantita,
        PrezzoUnitario: riga.PrezzoUnitario,
        ImportoRiga: riga.ImportoRiga,
        CodiceIVA: riga.CodiceIva,
        NumeroCommessa: riga.NumeroCommessa,
        TipoRiga: riga.TipoRiga,
        Pezzi: riga.Pezzi,
        Peso: riga.Peso,
        AnnoBolla: riga.AnnoBolla,
        NumeroBolla: riga.NumeroBolla,
        ScontoArticolo: riga.ScontoArticolo
      }));

      const toInsert = [];
      const toUpdate = [];
      for (let j = 0; j < righe.length; j += 1) {
        const riga = righe[j];
        const found = await FattureRighe.findOne({
          attributes: ['id'],
          where: {
            AnnoFattura: riga.AnnoFattura,
            NumeroFattura: riga.NumeroFattura,
            NrRiga: riga.NrRiga
          }
        });
        if (found) {
          // log.info(`Found commessa with id ${found.id}, to be updated`);
          toUpdate.push(riga);
        } else {
          // log.info(`Not found commessa ${commLav.NumeroCommessa}, to be inserted`);
          toInsert.push(riga);
        }
      }
      const attributesToUpdate = Object.keys(FattureRighe.tableAttributes).slice(1); // id column is not updated
      const resultInsert = await FattureRighe.bulkCreate(toInsert);
      const resultUpdate = await FattureRighe.bulkCreate(toUpdate, { updateOnDuplicate: attributesToUpdate });
      const resultDeletions = await deleteNonExistingFattureRighe(fattura, fattureRighe);
    }
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK. Fatture calcolate per anno: ${anno}.`, '[OK] Sapere Temprasud - Fatture Righe Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job fatture righe: ${error.message}`;
    await sendMail(message, `[ERROR] Sapere Temprasud - Fatture Righe Job. Fatture Anno ${anno}`);
  }
  // process.exit(0);
};

const getFattureRighe = async (annoFattura, numeroFattura) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/fatture/${annoFattura}/${numeroFattura}?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da`
  );
  if (response && response.status === 200) {
    return response.data;
  }

  return [];
};

const deleteNonExistingFattureRighe = async (fattura, fattureRighe) => {
  const allFattureRighe = await FattureRighe.findAll({
    attributes: ['id', 'NrRiga'],
    where: {
      AnnoFattura: fattura.AnnoFattura,
      NumeroFattura: fattura.NumeroFattura
    }
  });
  const incommingFattureRighe = fattureRighe.map((f) => f.NrRiga);
  const deletionCandidates = [];
  for (let i = 0; i < allFattureRighe.length; i += 1) {
    const rowFattura = allFattureRighe[i].dataValues;
    if (!incommingFattureRighe.includes(rowFattura.NrRiga)) {
      deletionCandidates.push(rowFattura.id);
    }
  }
  if (deletionCandidates.length > 0) {
    const deletedRowNumber = await FattureRighe.destroy({ where: { id: deletionCandidates } });
    return deletedRowNumber;
  }
  return 0;
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
  await jobFattureRighe(anno);
};

run();
