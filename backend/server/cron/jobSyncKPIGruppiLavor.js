/* eslint-disable max-len */
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const config = require('../config').jobKpiTabelle;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const log = config.log();

const jobSyncKPIGruppiLavor = async (anno) => {
  const startTime = new Date();
  try {
    log.info(`Rimuovo prima dalla tabella fatturato_gruppi_lavorazioni tutte le righe aventi anno=${anno}`);
    await deleteYear(anno);
    await updateGruppiLavorTable(anno);
    await sendMail(`TUTTO OK, elaborato anno=${anno}`, '[OK] Sapere Temprasud - fatturato_gruppi_lavorazioni Job');
    log.info('Finito di aggiornare la tabella fatturato_gruppi_lavorazioni');
  } catch (error) {
    log.error("Si è verificato un errore durante l'esecuzione del job sync fatturato_gruppi_lavorazioni", error);
    const message = `Si è verificato un errore durante l'esecuzione del job sync fatturato_gruppi_lavorazioni: ${error.stack}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - fatturato_gruppi_lavorazioni Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
};

const updateGruppiLavorTable = async (anno) => {
  const sql = `
    INSERT INTO jdcvjmnj_temprasud_bi.fatturato_gruppi_lavorazioni
  (gruppo_lavorazione, descr_gruppo_lavorazione, anno, mese_num, fatturato)
  SELECT
    GruppoLav,
    DescrizioneGruppoLav,
    AnnoFattura,
    mese,
    ROUND(SUM(IF(causalemagazzino IN ("022", "11"), importo, if(causalemagazzino IN ("10"), importo *-1, 0 ))), 2) as fatturato
  FROM
    (
    SELECT
      distinct
      lg.GruppoLav ,
      lg.DescrizioneGruppoLav,
      fr.mese_num,
      fr.ImportoRiga as importo,
      fr.AnnoFattura as AnnoFattura,
      fr.NumeroFattura,
      fr.mese_num as mese,
      fr.NrRiga,
      fr.CodiceArticolo,
      l.CodTrattamento,
      ft.Totale_Imponibile,
      ft.CausaleMagazzino as causalemagazzino,
      fr.id
    from
    lavorazioni l,
    lavorazioni_gruppi lg,
    fatture_testate ft,
    fatture_righe fr
  where
    fr.CodiceArticolo = l.CodTrattamento
    AND l.GruppoLav = lg.GruppoLav 
    AND fr.AnnoFattura = ft.AnnoFattura
    AND fr.NumeroFattura = ft.NumeroFattura
    AND fr.AnnoFattura =  ${anno}
    #per debug AND fr.AnnoFattura =  2023 AND fr.mese_num = 3
    ) as q
  GROUP BY
    GruppoLav,
    AnnoFattura,
    mese`;

  await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.INSERT
  });
};

const deleteYear = async (anno) => {
  const sql = `DELETE FROM fatturato_gruppi_lavorazioni WHERE anno = ${anno}`;

  await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.DELETE
  });
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
  await jobSyncKPIGruppiLavor(anno);
};

run();
