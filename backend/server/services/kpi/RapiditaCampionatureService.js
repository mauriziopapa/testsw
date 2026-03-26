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
  promises.push(TargetService.getTarget(inputTarget, 108));
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
    const [dataAutomotive, dataNonAutomotive] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpiAutomotive(t))),
      Promise.all(newTempo.map((t) => getKpiNonAutomotive(t)))
    ]);

    const sumAuto = dataAutomotive.reduce((acc, value) => acc + parseFloat(value), 0);
    const sumNonAuto = dataNonAutomotive.reduce((acc, value) => acc + parseFloat(value), 0);

    const averageAuto = sumAuto > 0 ? sumAuto / 4 : 0;
    const averageNonAuto = sumNonAuto > 0 ? sumNonAuto / 4 : 0;

    movingWindowAuto.push(averageAuto);
    movingWindownonAuto.push(averageNonAuto);
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
    automotive = await getKpiAutomotive(row);
  }
  if (tipologia === '-tutte-' || tipologia === 'non_automotive') {
    non_automotive = await getKpiNonAutomotive(row);
  }

  return {
    label: row.label,
    automotive,
    non_automotive,
    target
  };
}

async function getKpiNonAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiFromExcel(anno, row.trimestre, 'no');
  }

  return getKpiFromQWIN(anno, row.trimestre, null);
}

async function getKpiAutomotive(row) {
  const { anno } = row;

  if (anno < 2022) {
    return getKpiFromExcel(anno, row.trimestre, 'si');
  }

  return getKpiFromQWIN(anno, row.trimestre, 'Automotive');
}

async function getKpiFromExcel(anno, trimestre, automotive) {
  const query_kpi = `SELECT avg(tempo) as tempo
  FROM tempo_mesi LEFT JOIN excel_campionature AS e ON 
       tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data)
  WHERE tempo_mesi.trimestre = :trimestre 
  AND tempo_mesi.anno = :anno 
  AND e.automotive LIKE '%${automotive}%'`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno, trimestre },
    type: QueryTypes.SELECT
  });
  return kpi[0].tempo ? kpi[0].tempo : 0;
}

async function getKpiFromQWIN(anno, trimestre, automotive) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  let settore_applicativo = 'AND settore_applicativo IS NULL';
  if (automotive) {
    settore_applicativo = `AND settore_applicativo = '${automotive}'`;
  }

  const query_kpi = `
  SELECT ROUND(avg(lead_time), 2) as tempo
  FROM campionature
  WHERE data_ricezione_materiale 
  BETWEEN :from AND :to 
  ${settore_applicativo}`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { from, to },
    type: QueryTypes.SELECT
  });
  return kpi[0].tempo ? kpi[0].tempo : 0;
}
