/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const config = require('../config').jobPerformanceClienti;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const log = config.log();

const ReportPerformanceCliente = require('../models/bi/ReportPerformanceCliente');
const ClientiService = require('../services/ClientiService');
const TargetService = require('../services/kpi/TargetService');

const jobPerformanceClienti = async () => {
  const startTime = new Date();
  try {
    log.info('Truncating report_performance_clienti table');
    await ReportPerformanceCliente.truncate();

    const year = new Date().getFullYear();

    const top30 = false;
    const promises = [year].map((y) => ClientiService.getReportClienti(y, top30));
    const [clientiCurrentY] = await Promise.all(promises);

    const excelData = await getExcelData(clientiCurrentY);

    const created = await ReportPerformanceCliente.bulkCreate(excelData);

    log.info(`Insert into report_performance_clienti, created ${created.length}`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del jobPerformanceClienti: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - Performance Clienti Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail('TUTTO OK', '[OK] Sapere Temprasud - Performance Clienti Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
};

async function getExcelData(clienti) {
  const excelData = [];
  // uso ciclo for per problemi di performance con le promise, altrimenti
  // va in timeout la connessione al database
  for (let i = 0; i < clienti.length; i += 1) {
    const cliente = clienti[i];
    const data = await buildExcelData(cliente);
    excelData.push(data);
  }
  return excelData;
}

async function buildExcelData(cliente) {
  const codiceCliente = cliente.codice_anagrafica;
  const { anno } = cliente;

  const [ltMedio, percRitardo, reclami, ppmScarti] = await Promise.all([
    getLTMedio(codiceCliente, anno),
    getPercRitardo(codiceCliente, anno),
    getReclami(codiceCliente, anno),
    getPPMScarti(codiceCliente, anno)
  ]);

  // fatturato precedente rapportato al mese precedente
  let month = new Date().getMonth();
  if (month === 0) {
    month = 1;
  }
  /*
  Calcolo della media modificato il 26/07/2024 perchè è stato richiesto semplicemente
  il fatturato rapportato al periodo precedente, non la media
  const mediaFattPrec = (cliente.fatturato_prec / 12) * month;
  let variazione = 0;
  if (mediaFattPrec > 0) {
    variazione = (cliente.fatturato / mediaFattPrec) * 100 - 100;
  }
    */

  let variazione = 0;
  if (cliente.fatturato_prec > 0) {
    variazione = ((cliente.fatturato / cliente.fatturato_prec) * 100 - 100) / 100;
  }

  const clienteXcel = {
    cod_anagrafica: cliente.codice_anagrafica,
    rag_sociale: cliente.rag_sociale,
    anno,
    fatturato: cliente.fatturato,
    fatturato_prec: cliente.fatturato_prec,
    variazione_perc: variazione,
    lt_medio: ltMedio,
    ritardo_perc: percRitardo,
    reclami,
    ppm_scarti: ppmScarti
  };

  return clienteXcel;
}

async function getPPMScarti(codiceCliente, anno) {
  let sql = `
  SELECT
    YEAR(nc.DataNC) AS anno,
    c.\`Codice Cliente\`,
    c.\`Numero Commessa\`,
    IFNULL(SUM(nc.PezziNonConformi), 0) AS val
  FROM
    commesse_nc AS nc,
    commesse c 
  WHERE
    TipoNC = 18
    and YEAR(nc.DataNC) = :anno
    and nc.Commessa = c.\`Numero Commessa\` 
    and c.\`Codice Cliente\` = :codiceCliente`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { codiceCliente, anno },
    type: QueryTypes.SELECT
  });

  sql = `
  SELECT
    IFNULL(SUM(r.Pezzi), 0) AS val,
    ft.CodiceCliente
  FROM
    fatture_righe AS r,
    fatture_testate ft
  WHERE
    r.AnnoFattura = :anno
    and r.NumeroFattura = ft.NumeroFattura
    and r.Um = "Pz"
    and ft.CodiceCliente = :codiceCliente
  GROUP BY
    r.AnnoFattura`;

  const kpiPezzi = await dbBi.sequelizeBi.query(sql, {
    replacements: { codiceCliente, anno },
    type: QueryTypes.SELECT
  });

  if (thereIsNoValue(kpi, kpiPezzi)) {
    return 0;
  }

  return (kpi[0].val / kpiPezzi[0].val) * 1000000;
}

async function getReclami(codiceCliente, anno) {
  const sql = ` 
  SELECT DISTINCT 
    COUNT(cn.NumeroNC) as reclami,
    c.\`Codice Cliente\`,
    c.\`Nome Cliente\` 
  FROM
    commesse_nc cn,
    commesse c 
  WHERE
    cn.TipoNC = 18
    AND cn.Commessa = c.\`Numero Commessa\` 
    AND cn.AnnoNC = :anno
    AND c.\`Codice Cliente\` = :codiceCliente
  GROUP BY c.\`Codice Cliente\``;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { codiceCliente, anno },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    return 0;
  }

  return kpi[0].reclami;
}

async function getLTMedio(codiceCliente, anno) {
  const sql = `
  SELECT c.macroarea AS gruppo,
    AVG(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`)) AS lt,
    COUNT(*) AS ncommesse, 
    m.macroarea,
    m.id AS mid  
  FROM commesse AS c
  INNER JOIN macroaree AS m ON m.id = c.macroarea
  WHERE YEAR(c.\`Data Bolla\`) = ${anno}
    AND DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) < 31
    AND c.\`Codice Cliente\` = '${codiceCliente}' 
    AND (c.\`Flag Evasa\` = 1 OR c.\`Flag Evasa\` = 'Y')
  GROUP BY m.macroarea
  ORDER BY m.id ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  let commesse = 0;
  let ltPonderato = 0;

  kpi.forEach((val) => {
    // aggiorno il totale commesse
    commesse += val.ncommesse;
    // aggiorno il calcolo ponderato che alla fine sottrarrò per $commesse
    ltPonderato += val.lt * val.ncommesse;
  });

  ltPonderato /= commesse;

  if (!Number.isFinite(ltPonderato)) {
    ltPonderato = 0;
  }

  return parseFloat(ltPonderato.toFixed(2));
}

async function getPercRitardo(codiceCliente, anno) {
  const target = await TargetService.getTarget(anno, 123);
  let targetLt = 0;
  if (target) {
    targetLt = target;
  }
  const sql = `
  SELECT c.macroarea AS gruppo,
    AVG(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`)) AS lt,
    COUNT(*) AS ncommesse, 
    SUM(IF(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) > ${targetLt} AND DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) < 31, 1, 0)) AS in_ritardo,
    m.macroarea,
    m.id AS mid  
  FROM commesse AS c
  INNER JOIN macroaree AS m ON m.id = c.macroarea
  WHERE YEAR(c.\`Data Bolla\`) = ${anno}
  AND c.\`Codice Cliente\` = '${codiceCliente}' 
  AND (c.\`Flag Evasa\` = 1 OR c.\`Flag Evasa\` = 'Y')
  GROUP BY m.macroarea
  ORDER BY m.id ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  let commesse = 0;
  let inRitardo = 0;
  let ritardoPercMedio = 0;

  kpi.forEach((val) => {
    // aggiorno il totale commesse
    commesse += val.ncommesse;
    inRitardo += val.in_ritardo;
  });

  ritardoPercMedio = (inRitardo / commesse) * 100;
  if (!Number.isFinite(ritardoPercMedio)) {
    ritardoPercMedio = 0;
  }

  return parseFloat(ritardoPercMedio.toFixed(2));
}

const thereIsNoValue = (kpi, kpiPezzi) => {
  if (kpi && kpiPezzi) {
    if (kpiPezzi.length === 0) {
      return true;
    }

    if (kpi[0].val === 0) {
      return true;
    }

    return false;
  }
  return true;
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

jobPerformanceClienti();
