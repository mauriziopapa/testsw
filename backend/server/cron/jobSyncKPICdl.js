/* eslint-disable max-len */
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const config = require('../config').jobKpiTabelle;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const log = config.log();

const jobSyncKPICdl = async (anno) => {
  const startTime = new Date();
  try {
    log.info(`Rimuovo prima dalla tabella fatturato_gruppi_cdl tutte le righe aventi anno=${anno}`);
    await deleteYear(anno);
    await updateCdlTAble(anno);
    await sendMail(`TUTTO OK, elaborato anno=${anno}`, '[OK] Sapere Temprasud - fatturato_gruppi_cdl Job');
    log.info('Finito di aggiornare la tabella fatturato_gruppi_cdl');
  } catch (error) {
    log.error("Si è verificato un errore durante l'esecuzione del job sync fatturato_gruppi_cdl", error);
    const message = `Si è verificato un errore durante l'esecuzione del job sync fatturato_gruppi_cdl: ${error.stack}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - fatturato_gruppi_cdl Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
};

const updateCdlTAble = async (anno) => {
  const sql = `
  INSERT INTO jdcvjmnj_temprasud_bi.fatturato_gruppi_cdl
  (gruppo_cdl, descr_cdl, anno, mese_num, fatturato)
  (SELECT
    GruppoCdL,
    descrizione,
    AnnoFattura,
    mese,
    ROUND(SUM(IF(causalemagazzino IN ("022", "11"), importo, if(causalemagazzino IN ("10"), importo *-1, 0 ))), 2) as fatturato
  FROM
    (
    SELECT
      distinct
      cg.GruppoCdL as GruppoCdL,
      cg.DescrizioneGruppoCdL as descrizione,
      #l.CodTrattamento,
      #l.GruppoLav,
      #cl.IDCentro,
      #cl.CodLavorazione,
      #fr.CodiceArticolo,
      fr.AnnoFattura as AnnoFattura,
      fr.NumeroFattura,
      fr.mese_num as mese,
      fr.NrRiga,
      fr.ImportoRiga as importo,
      ft.CausaleMagazzino as causalemagazzino,
      fr.id
      #cdl.IDCentro,
      #cdl.GruppoCdL,
      #cg.DescrizioneGruppoCdL
    from
      cdl_gruppi cg,
      centri_di_lavoro cdl,
      cdl_lavorazioni cl,
      lavorazioni l,
      fatture_righe fr,
      fatture_testate ft
    where
      cdl.GruppoCdL = cg.GruppoCdL
      AND cl.IDCentro = cdl.IDCentro
      AND l.CodTrattamento = cl.CodLavorazione
      AND fr.CodiceArticolo = l.CodTrattamento
      AND fr.AnnoFattura = ft.AnnoFattura
      AND fr.NumeroFattura = ft.NumeroFattura
      AND fr.AnnoFattura = ${anno}
      #per questioni di performance solo anno in corso
      # AND cdl.GruppoCdL = "CMT" utile per debug
  UNION
    SELECT
      distinct
      "NESSUN GRUPPO" as GruppoCdL,
      "Nessun Cod Articolo" as descrizione,
      fr.AnnoFattura as AnnoFattura,
      fr.NumeroFattura,
      fr.mese_num as mese,
      fr.NrRiga,
      fr.ImportoRiga as importo,
      ft.CausaleMagazzino as causalemagazzino,
      fr.id
    from
      fatture_righe fr,
      fatture_testate ft
    where
      fr.CodiceArticolo IS NULL
      AND fr.AnnoFattura = ft.AnnoFattura
      AND fr.NumeroFattura = ft.NumeroFattura
      AND fr.AnnoFattura = ${anno}
  UNION
    SELECT
      "ALTRO" as GruppoCdL,
      "Altro" as descrizione,
      fr.AnnoFattura as AnnoFattura,
      fr.NumeroFattura,
      fr.mese_num as mese,
      fr.NrRiga,
      fr.ImportoRiga as importo,
      ft.CausaleMagazzino as causalemagazzino,
      fr.id
    from
      fatture_righe fr,
      fatture_testate ft
    where
      fr.AnnoFattura = ${anno}
      AND fr.AnnoFattura = ft.AnnoFattura
      AND fr.NumeroFattura = ft.NumeroFattura
      AND fr.CodiceArticolo NOT IN (
      SELECT
        cl.CodLavorazione
      FROM
        cdl_lavorazioni cl
    )
    ) as q
  GROUP BY
    GruppoCdL,
    descrizione,
    AnnoFattura,
    mese
    )
  ON DUPLICATE KEY UPDATE fatturato=fatturato;`;

  await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.INSERT
  });
};

const deleteYear = async (anno) => {
  const sql = `DELETE FROM fatturato_gruppi_cdl WHERE anno = ${anno}`;

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
  await jobSyncKPICdl(anno);
};

run();
