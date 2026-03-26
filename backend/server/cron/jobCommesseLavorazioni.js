/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');
const { Op } = require('sequelize');

const config = require('../config').jobQWIN;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const Commessa = require('../models/bi/Commessa');
const CommesseLavorazioni = require('../models/bi/CommesseLavorazioni');

const log = config.log();

const processCommessa = async (commessa) => {
  try {
    const lavorazioni = await getLavorazioni(commessa['Numero Commessa']);

    const commesseLavorazioni = lavorazioni.map((l) => ({
      id: null,
      NumeroCommessa: l.NumeroCommessa,
      Sequenza: l.Sequenza,
      IDLavorazione: l.IDLavorazione,
      Programma: l.Programma,
      Impianto: l.Impianto,
      LavorazioneSuCarica: l.LavorazioneSuCarica,
      LavorazioneSuCommessa: l.LavorazioneSuCommessa,
      Note: l.Note,
      TipoCentroLavoro: l.TipoCentroLavoro,
      PrezzoTotale: l.PrezzoTotale,
      InFattura: l.InFattura,
      InBolla: l.InBolla,
      GruppoLav: l.Lavorazioni.GruppoLav
    }));

    for (let j = 0; j < commesseLavorazioni.length; j += 1) {
      const commLav = commesseLavorazioni[j];
      const found = await CommesseLavorazioni.findOne({
        attributes: ['id'],
        where: {
          NumeroCommessa: commLav.NumeroCommessa,
          Sequenza: commLav.Sequenza,
          IDLavorazione: commLav.IDLavorazione,
          Programma: commLav.Programma,
          Impianto: commLav.Impianto
        }
      });

      if (found) {
        commesseLavorazioni[j].id = found.id;
      }
    }

    await CommesseLavorazioni.bulkCreate(commesseLavorazioni, { updateOnDuplicate: ['id'] });
    return true;
  } catch (error) {
    log.error(`Errore durante l'elaborazione della commessa ${commessa['Numero Commessa']}: ${error.message}`);
    return false;
  }
};

const jobCommesseLavorazioni = async (anno) => {
  const startTime = new Date();

  try {
    const commesse = await Commessa.findAll({
      where: {
        'Data Bolla': {
          [Op.and]: [
            { [Op.between]: [moment().subtract(12, 'months').toDate(), moment().toDate()] },
            dbBi.sequelizeBi.where(dbBi.sequelizeBi.fn('YEAR', dbBi.sequelizeBi.col('Data Bolla')), anno)
          ]
        }
      }
    });

    const batchSize = 5;
    const status = {
      success: 0,
      error: 0
    };

    for (let i = 0; i < commesse.length; i += batchSize) {
      const batch = commesse.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((c) => processCommessa(c)));
      status.success += results.filter((r) => r).length;
      status.error += results.filter((r) => !r).length;
    }

    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(
      `TUTTO OK, elaborato anno=${anno}`,
      `[OK] Sapere Temprasud - QWIN Commesse Lavorazioni Job\nSuccess: ${status.success}\nError: ${status.error}`
    );
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job commesse lavorazioni: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Commesse Lavorazioni Job');
  }
  // process.exit(0);
};

const getLavorazioni = async (numeroCommessa) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/commesse/lavorazioni?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&commessa=${numeroCommessa}`
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
  await jobCommesseLavorazioni(anno);
};

run();
