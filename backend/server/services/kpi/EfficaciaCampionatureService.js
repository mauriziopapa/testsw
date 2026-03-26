/* eslint-disable max-len */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, getMonthIntervalFromTrimestre, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const moment = require('moment');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindowAuto = [];
  const movingWindownonAuto = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const tipologia = filters.tipologia ? filters.tipologia.trim() : '';
  const inputTarget = filters.target;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(inputTarget, 107));
  const [tempo, target] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildData(t, target, tipologia));
  const dataValues = await Promise.all(dataPromises);

  const ending = moment(al);

  for (let i = tempo.length - 1; i >= 0; i--) {
    const offset = i * 3;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );

    const [dataAutomotive, dataNonAutomotive, dataTotAutomotive, dataTotNonAutomotive] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpiAutomotive(t))),
      Promise.all(newTempo.map((t) => getKpiNonAutomotive(t))),
      Promise.all(newTempo.map((t) => getKpiTotAutomotive(t))),
      Promise.all(newTempo.map((t) => getKpiTotNonAutomotive(t)))
    ]);

    const calcNonAuto = dataNonAutomotive.map((currElement, index) => {
      return currElement / dataTotNonAutomotive[index];
    });

    const sumNonAuto = calcNonAuto.reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);

    // Calcoliamo la media mobile per "NON Automotive"
    movingAverageNonAuto = sumNonAuto > 0 ? (sumNonAuto * 100) / 4 : 0;

    const calcAuto = dataAutomotive.map((currElement, index) => {
      return currElement / dataTotAutomotive[index];
    });

    const sumAuto = calcAuto.reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);

    // Calcoliamo la media mobile per "Automotive"
    movingAverageAuto = sumAuto > 0 ? (sumAuto * 100) / 4 : 0;

    movingWindowAuto.push(movingAverageAuto);
    movingWindownonAuto.push(movingAverageNonAuto);
  }

  for (let i = 0; i < dataValues.length; i++) {
    dataValues[i].movingAverageAuto = movingWindowAuto[i].toFixed(2);
    dataValues[i].movingAverageNonAuto = movingWindownonAuto[i].toFixed(2);
  }

  dataValues.forEach((d) => {
    results.push(d);
  });
  return results;
};

async function buildData(row, target, tipologia) {
  let automotive = 0;
  let non_automotive = 0;

  if (tipologia === '-tutte-' || tipologia === 'automotive') {
    const conto_automotive = await getKpiAutomotive(row);
    // prendo il totale
    const totale_automotive = await getKpiTotAutomotive(row);

    if (totale_automotive !== 0) {
      automotive = (conto_automotive / totale_automotive) * 100;
    }
  }

  if (tipologia === '-tutte-' || tipologia === 'non_automotive') {
    const conto_nonautomotive = await getKpiNonAutomotive(row);
    // prendo il totale
    const totale_nonautomotive = await getKpiTotNonAutomotive(row);

    if (totale_nonautomotive !== 0) {
      non_automotive = (conto_nonautomotive / totale_nonautomotive) * 100;
    }
  }

  return {
    label: row.label,
    automotive,
    non_automotive,
    target
  };
}

async function getKpiTotNonAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiTotFromExcel(anno, row.trimestre, 'no');
  }

  return getKpiTotFromQWIN(anno, row.trimestre, null);
}

async function getKpiNonAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiFromExcel(anno, row.trimestre, 'no');
  }

  return getKpiFromQWIN(anno, row.trimestre, null);
}

async function getKpiTotAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiTotFromExcel(anno, row.trimestre, 'si');
  }

  return getKpiTotFromQWIN(anno, row.trimestre, 'Automotive');
}

async function getKpiAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiFromExcel(anno, row.trimestre, 'si');
  }

  return getKpiFromQWIN(anno, row.trimestre, 'Automotive');
}

async function getKpiFromExcel(anno, trimestre, automotive) {
  const query_kpi = `
  SELECT count(*) as conteggio 
  FROM tempo_mesi LEFT JOIN excel_campionature AS e ON 
    tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data) 
  WHERE esito = 1 
  AND tempo_mesi.trimestre = :trimestre 
  AND tempo_mesi.anno = :anno 
  AND e.automotive LIKE '%${automotive}%'`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno, trimestre },
    type: QueryTypes.SELECT
  });
  return kpi[0].conteggio ? kpi[0].conteggio : 0;
}

async function getKpiTotFromExcel(anno, trimestre, automotive) {
  const query_kpi = `
  SELECT count(*) as totale 
  FROM tempo_mesi LEFT JOIN excel_campionature AS e ON 
    tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data) 
  WHERE tempo_mesi.trimestre = :trimestre 
  AND tempo_mesi.anno = :anno 
  AND e.automotive LIKE '%${automotive}%'`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno, trimestre },
    type: QueryTypes.SELECT
  });
  return kpi[0].totale ? kpi[0].totale : 0;
}

async function getKpiFromQWIN(anno, trimestre, automotive) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  let settore_applicativo = 'AND settore_applicativo IS NULL';
  if (automotive) {
    settore_applicativo = `AND settore_applicativo = '${automotive}'`;
  }

  const query_kpi = `
  SELECT COUNT(*) as totale
  FROM campionature
  WHERE data_ricezione_materiale 
  BETWEEN :from AND :to 
  AND esito = 1 
  ${settore_applicativo}`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { from, to },
    type: QueryTypes.SELECT
  });
  return kpi[0].totale ? kpi[0].totale : 0;
}

async function getKpiTotFromQWIN(anno, trimestre, automotive) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  let settore_applicativo = 'AND settore_applicativo IS NULL';
  if (automotive) {
    settore_applicativo = `AND settore_applicativo = '${automotive}'`;
  }

  const query_kpi = `
  SELECT COUNT(*) as conteggio
  FROM campionature
  WHERE data_ricezione_materiale 
  BETWEEN :from AND :to 
  ${settore_applicativo}`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { from, to },
    type: QueryTypes.SELECT
  });
  return kpi[0].conteggio ? kpi[0].conteggio : 0;
}
