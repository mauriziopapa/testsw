/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');
const config = require('../config').jobQWIN;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const MovimentiCommessa = require('../models/bi/MovimentiCommessa');

const log = config.log();

const jobMovimentiCommessa = async (from, to) => {
  const transaction = await dbBi.sequelizeBi.transaction();

  const startTime = new Date();

  try {
    const movimentiCommessa = await getMovimentiCommessa(from, to);

    const toInsert = movimentiCommessa.map((item) => {
      let giornoEntrataFormatted = null;
      if (item.OraEntrata != null && item.GiornoConsuntivo != null) {
        const giornoEntrataInizio = item.GiornoConsuntivo.split('T');
        // Purtroppo le date nel campo OraEntrata sono tutte con la data 1899-12-30
        // // quindi posso prendere solo l'ora, la data tocca prenderla da GiornoConsuntivo
        const oraEntrataTime = item.OraEntrata.split('T');
        const giornoEntrata = giornoEntrataInizio[0];
        const oraEntrataTimeOffset = oraEntrataTime[1];
        giornoEntrataFormatted = `${giornoEntrata} ${oraEntrataTimeOffset}`;
      }

      let giornoUscitaFormatted = null;
      if (item.OraUscita != null && item.GiornoConsuntivoFine != null) {
        const giornoUscitaFine = item.GiornoConsuntivoFine.split('T');
        // Purtroppo le date nel campo OraUscita sono tutte con la data 1899-12-30
        // quindi posso prendere solo l'ora, la data tocca prenderla da GiornoConsuntivoFine
        const oraUscitaTime = item.OraUscita.split('T');
        const giornoUscita = giornoUscitaFine[0];
        const oraUscitaTimeOffset = oraUscitaTime[1];
        giornoUscitaFormatted = `${giornoUscita} ${oraUscitaTimeOffset}`;
      }
      return {
        IDMovCommessa: item.IDMovCommessa,
        GiornoConsuntivo: item.GiornoConsuntivo,
        OraEntrata: giornoEntrataFormatted,
        GiornoConsuntivoFine: item.GiornoConsuntivoFine,
        OraUscita: giornoUscitaFormatted,
        TempoConsuntivo: item.TempoConsuntivo,
        NumeroCommessa: item.NumeroCommessa,
        SottoCommessa: item.SottoCommessa,
        IDLavorazione: item.IDLavorazione,
        IDOperatore: item.IDOperatore,
        NumAccontoCommessa: item.NumAccontoCommessa,
        Peso: item.Peso,
        Pezzi: item.Pezzi,
        Saldo: item.Saldo,
        IDCausale: item.IDCausale,
        NumeroCarica: item.IDCarica,
        IDMovCarica: item.IDMovCarica,
        Sequenza: item.Sequenza,
        PesoLordo: item.PesoLordo,
        Messung1: item.Messung1,
        Rilavorazione: item.Rilavorazione,
        Impianto: item.IDCentro,
        Programma: item.Programma,
        IDCollaudo: item.IDCollaudo,
        IDAllegato: item.IDAllegato,
        AnnoNC: item.AnnoNC,
        NumeroNC: item.NumeroNC,
        TipoNC: item.TipoNC,
        AzioneNC: item.AzioneNC,
        AttivitaNC: item.AttivitaNC,
        CausaNC: item.CausaNC,
        conversione_effettuata: 0
      };
    });

    const updateOnDuplicate = Object.keys(MovimentiCommessa.tableAttributes).slice(2); // id column is not updated and IDMovCommessa is the unique key for updateOnDuplicate
    const resultInsert = await MovimentiCommessa.bulkCreate(toInsert, {
      updateOnDuplicate,
      transaction
    });
    log.info(`inserted ${resultInsert.length}`);
    // Commit the transaction
    await transaction.commit();
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(
      `TUTTO OK, elaborato from=${from}, to=${to}. Inseriti ${resultInsert.length} record.`,
      '[OK] Sapere Temprasud - QWIN Movimenti Commessa Job'
    );
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    // If any error occurred, roll back the transaction
    await transaction.rollback();
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job jobMovimentiCommessa: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - QWIN Movimenti Commessa Job');
  }
  // process.exit(0);
};

const getMovimentiCommessa = async (from, to) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/commesse/movimenti?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da=${from}&a=${to}`
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
  await jobMovimentiCommessa(from, to);

  const fromPrev = previousMonth.startOf('month').format('YYYY-MM-DD');
  const toPrev = previousMonth.endOf('month').format('YYYY-MM-DD');
  await jobMovimentiCommessa(fromPrev, toPrev);
};

run();
