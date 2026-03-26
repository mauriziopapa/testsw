/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');

const config = require('../config').jobFatture;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const BolleScaricoTestate = require('../models/bi/BolleScaricoTestate');
const BolleScaricoRighe = require('../models/bi/BolleScaricoRighe');

const log = config.log();

const jobBolleScaricoRighe = async (anno) => {
  const startTime = new Date();

  try {
    const bolle = await BolleScaricoTestate.findAll({
      where: {
        DataBolla: dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('DataBolla')), anno)
      }
    });

    for (let i = 0; i < bolle.length; i += 1) {
      const bolla = bolle[i];
      const bolleScaricoRighe = await getBolleScaricoRighe(bolla.AnnoBolla, bolla.NumeroBolla);

      const righe = bolleScaricoRighe.map((riga) => ({
        mese_num: bolla.DataBolla.getMonth() + 1,
        IDRiga: riga.IDRiga,
        Progressivo: riga.Progressivo,
        AnnoBolla: riga.AnnoBolla,
        SerieBolla: riga.SerieBolla,
        NumeroBolla: riga.NumeroBolla,
        NumeroCommessa: riga.NumeroCommessa,
        CodiceArticolo: riga.CodiceArticolo,
        DescrizioneArticolo: riga.DescrizioneArticolo,
        Pezzi: riga.Pezzi,
        Peso: riga.Peso,
        InizioGruppoCommessa: riga.InizioGruppoCommessa,
        TipoRiga: riga.TipoRiga,
        NumeroCommessaSenzaAnno: riga.NumeroCommessaSenzaAnno,
        Grassetto: riga.Grassetto
      }));

      const toInsert = [];
      const toUpdate = [];
      for (let j = 0; j < righe.length; j += 1) {
        const riga = righe[j];
        const found = await BolleScaricoRighe.findOne({
          attributes: ['id'],
          where: {
            AnnoBolla: riga.AnnoBolla,
            NumeroBolla: riga.NumeroBolla,
            Progressivo: riga.Progressivo
          }
        });
        if (found) {
          // log.info(`Found bolla with id ${found.id}, to be updated`);
          toUpdate.push(riga);
        } else {
          // log.info(`Not found bolla ${bolla.NumeroBolla}, to be inserted`);
          toInsert.push(riga);
        }
      }
      const attributesToUpdate = Object.keys(BolleScaricoRighe.tableAttributes).slice(1); // id column is not updated
      const resultInsert = await BolleScaricoRighe.bulkCreate(toInsert);
      const resultUpdate = await BolleScaricoRighe.bulkCreate(toUpdate, { updateOnDuplicate: attributesToUpdate });
      const resultDeletions = await deleteNonExistingBolleScaricoRighe(bolla, bolleScaricoRighe);
    }
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK. Bolle calcolate per anno: ${anno}.`, '[OK] Sapere Temprasud - Bolle Scarico Righe Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job bolle scarico righe: ${error.message}`;
    await sendMail(message, `[ERROR] Sapere Temprasud - Bolle Scarico Righe Job. Bolle Anno ${anno}`);
  }
  // process.exit(0);
};

const getBolleScaricoRighe = async (annoBolla, numeroBolla) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/bollescarico/${annoBolla}/${numeroBolla}?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da`
  );
  if (response && response.status === 200) {
    return response.data;
  }

  return [];
};

const deleteNonExistingBolleScaricoRighe = async (bolla, bolleScaricoRighe) => {
  const allBolleScaricoRighe = await BolleScaricoRighe.findAll({
    attributes: ['id', 'Progressivo'],
    where: {
      AnnoBolla: bolla.AnnoBolla,
      NumeroBolla: bolla.NumeroBolla
    }
  });
  const incommingBolleScaricoRighe = bolleScaricoRighe.map((f) => f.Progressivo);
  const deletionCandidates = [];
  for (let i = 0; i < allBolleScaricoRighe.length; i += 1) {
    const rowBolla = allBolleScaricoRighe[i].dataValues;
    if (!incommingBolleScaricoRighe.includes(rowBolla.Progressivo)) {
      deletionCandidates.push(rowBolla.id);
    }
  }
  if (deletionCandidates.length > 0) {
    const deletedRowNumber = await BolleScaricoRighe.destroy({ where: { id: deletionCandidates } });
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
  await jobBolleScaricoRighe(anno);
};

run();
