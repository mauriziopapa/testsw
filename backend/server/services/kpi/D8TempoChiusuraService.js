/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, getMonthIntervalFromTrimestre, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const movingWindow = [];
  const data = [];
  let nc_tot = 0;
  let gg_chiusura_sum = 0;
  let gg_chiusura_sum_auto = 0;
  let gg_chiusura_sum_nonauto = 0;

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, tipologia, kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  const ending = moment(al);

  for (let i = tempo.length - 1; i >= 0; i--) {
    const offset = i * 3;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );
    // Ottenere i dati KPI per le due categorie
    const [newAutomotive, newNonAutomotive] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpi(t.trimestre, t.anno, 'Y'))),
      Promise.all(newTempo.map((t) => getKpi(t.trimestre, t.anno, 'N')))
    ]);

    const sumAuto = newAutomotive.reduce((sum, value) => sum + value.tempochiusura_avg, 0);
    const sumNonAuto = newNonAutomotive.reduce((sum, value) => sum + value.tempochiusura_avg, 0);
    const sum = sumAuto >= 0 && sumNonAuto >= 0 ? sumAuto + sumNonAuto : 0;
    const average = sum / 4;

    movingWindow.push(average);
  }

  for (let i = 0; i < tempo.length; i++) {
    const row = tempo[i];

    let kpi_automotive = {};
    let kpi_nonautomotive = {};
    if (tipologia === 'automotive') {
      // prendo il kpi (8d tempo chiusura automotive)
      kpi_automotive = await getKpi(row.trimestre, row.anno, 'Y');
    } else if (tipologia === 'non_automotive') {
      // prendo il kpi (8d tempo chiusura non automotive)
      kpi_nonautomotive = await getKpi(row.trimestre, row.anno, 'N');
    } else {
      // prendo tutti (8d tempo chiusura)
      kpi_automotive = await getKpi(row.trimestre, row.anno, 'Y');
      kpi_nonautomotive = await getKpi(row.trimestre, row.anno, 'N');
    }

    nc_tot += kpi_automotive.conteggio || 0;
    gg_chiusura_sum += kpi_automotive.tempochiusura_sum || 0;
    gg_chiusura_sum_auto += kpi_automotive.tempochiusura_sum || 0;
    const automotive = kpi_automotive.tempochiusura_avg ? kpi_automotive.tempochiusura_avg.toFixed(2) : 0;

    nc_tot += kpi_nonautomotive.conteggio || 0;
    gg_chiusura_sum += kpi_nonautomotive.tempochiusura_sum || 0;
    gg_chiusura_sum_nonauto += kpi_nonautomotive.tempochiusura_sum || 0;
    const non_automotive = kpi_nonautomotive.tempochiusura_avg ? kpi_nonautomotive.tempochiusura_avg.toFixed(2) : 0;

    data.push({
      label: row.label,
      automotive,
      non_automotive,
      target: targetLevel
    });
  }

  for (let i = 0; i < data.length; i++) {
    data[i].movingAvg = movingWindow[i].toFixed(2);
  }

  results.push({
    data,
    nc_tot,
    gg_chiusura_sum: gg_chiusura_sum
  });

  return results;
};

async function getKpi(trimestre, anno, tipologia) {
  const { from, to } = getMonthIntervalFromTrimestre(trimestre, anno);

  const tipologiaCondition = tipologia ? `AND FlagAutomotive = '${tipologia}'` : '';
  const sql = `
    SELECT
      DataNC,
      DataChiusNC
    FROM
      commesse_nc
    WHERE
      Flag8D = 'Y'
      AND NCChiusa = 'Y'
      AND TipoNC = 18
      AND DataNC BETWEEN :from AND :to 
      ${tipologiaCondition}`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to },
    type: QueryTypes.SELECT
  });
  const conteggio = kpi.length;
  const tempochiusura_sum = kpi
    .map((k) => moment(k.DataChiusNC).diff(moment(k.DataNC), 'days'))
    .reduce((partialSum, a) => partialSum + a, 0);
  let tempochiusura_avg = 0;
  if (conteggio > 0) {
    tempochiusura_avg = tempochiusura_sum / conteggio;
  }
  return { conteggio, tempochiusura_sum, tempochiusura_avg };
}
