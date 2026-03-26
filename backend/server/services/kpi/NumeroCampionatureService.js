/* eslint-disable prefer-const */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, getMonthIntervalFromTrimestre, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const moment = require('moment');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, tipologia, kpi_id } = filters;

  let promises = [];
  let movingWindowAuto = [];
  let movingWindownonAuto = [];

  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  promises = tempo.map((t) => buildData(t, targetLevel, tipologia));
  const results = await Promise.all(promises);

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

    const sumAuto = dataAutomotive.reduce((acc, value) => acc + value.data, 0);
    const sumNonAuto = dataNonAutomotive.reduce((acc, value) => acc + value.data, 0);

    const averageAuto = sumAuto > 0 ? sumAuto / 4 : 0;
    const averageNonAuto = sumNonAuto > 0 ? sumNonAuto / 4 : 0;

    movingWindowAuto.push(averageAuto);
    movingWindownonAuto.push(averageNonAuto);
  }

  for (let i = 0; i < results.length; i++) {
    results[i].valori.data.push(
      new Value.Builder().setLabel('Media mobile Automotive').setData(movingWindowAuto[i].toFixed(2)).build()
    );
    results[i].valori.data.push(
      new Value.Builder().setLabel('Media mobile NON Automotive').setData(movingWindownonAuto[i].toFixed(2)).build()
    );
  }

  // Aggiorniamo i valori totali per "Automotive" e "NON Automotive"
  const { automotive, nonautomotive } = updateTot(results);
  const tot = automotive + nonautomotive;

  return { tot, tot_auto: automotive, tot_noauto: nonautomotive, valueGroup: results };
};

async function buildData(tempo, target, tipologia) {
  let automotive = 0;
  let nonAutomotive = 0;
  if (tipologia === '-tutte-' || tipologia === 'automotive') {
    automotive = await getKpiAutomotive(tempo);
  }
  if (tipologia === '-tutte-' || tipologia === 'non_automotive') {
    nonAutomotive = await getKpiNonAutomotive(tempo);
  }
  const valori = new Value.Builder().setLabel('').setData([automotive, nonAutomotive]).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori(valori).setTarget(target).build();
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
  const query = `
  SELECT COUNT(*) as conto
  FROM tempo_mesi LEFT JOIN excel_campionature AS e ON 
        tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data) and tempo_mesi.semestre_num != 0
  WHERE tempo_mesi.trimestre = :trimestre 
  AND tempo_mesi.anno = :anno 
  AND e.automotive LIKE '%${automotive}%'`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, trimestre },
    type: QueryTypes.SELECT
  });

  const val = kpi[0].conto ? kpi[0].conto : 0;
  if (automotive) {
    return new Value.Builder().setLabel('Automotive').setData(val).build();
  }
  return new Value.Builder().setLabel('NON Automotive').setData(val).build();
}

async function getKpiFromQWIN(anno, trimestre, automotive) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  let settore_applicativo = 'AND settore_applicativo IS NULL';
  if (automotive) {
    settore_applicativo = `AND settore_applicativo = '${automotive}'`;
  }

  const query = `
  SELECT COUNT(*) as conto
  FROM campionature
  WHERE data_ricezione_materiale 
  BETWEEN :from AND :to 
  ${settore_applicativo}`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { from, to },
    type: QueryTypes.SELECT
  });

  const val = kpi[0].conto ? kpi[0].conto : 0;
  if (automotive) {
    return new Value.Builder().setLabel('Automotive').setData(val).build();
  }
  return new Value.Builder().setLabel('NON Automotive').setData(val).build();
}

function updateTot(results) {
  let automotive = 0;
  let nonautomotive = 0;
  // Conto nc totali
  results.forEach((r) => {
    r.valori.data.forEach((d) => {
      const dataValue = parseFloat(d.data);
      if (!isNaN(dataValue)) {
        // Verifica se dataValue è un numero
        if (d.label === 'Automotive') {
          automotive += dataValue;
        } else if (d.label === 'NON Automotive') {
          nonautomotive += dataValue;
        }
      }
    });
  });

  return { automotive, nonautomotive };
}
