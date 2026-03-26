/* eslint-disable prefer-const */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const moment = require('moment');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const AUTOMOTIVE = 62;
const NON_AUTOMOTIVE = 63;

module.exports.getKpiValues = async (filters) => {
  const movingWindow = [];
  let nc_tot = 0;

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, kpi_id } = filters;

  let promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  promises = tempo.map((t) => buildData(t, targetLevel));
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
    // Ottenere i dati KPI per le due categorie
    const [automotive, nonAutomotive] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpi(t, AUTOMOTIVE))),
      Promise.all(newTempo.map((t) => getKpi(t, NON_AUTOMOTIVE)))
    ]);

    const sumAuto = automotive.reduce((sum, value) => sum + value, 0);
    const sumNonAuto = nonAutomotive.reduce((sum, value) => sum + value, 0);
    const sum = sumAuto >= 0 && sumNonAuto >= 0 ? sumAuto + sumNonAuto : 0;
    const average = sum / 4;

    movingWindow.push(average);
  }

  for (let i = 0; i < results.length; i++) {
    results[i].valueGroup.valori.data.push(
      new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build()
    );
  }

  results.forEach((result) => {
    result.valueGroup.valori.data.forEach((val) => {
      if ((val.label === 'Automotive' || val.label === 'Non Automotive') && parseFloat(val.data) > 0) {
        nc_tot++;
      }
    });
  });
  return {
    results: results.map((r) => r.valueGroup),
    nc_tot
  };
};

async function buildData(tempo, target) {
  // prendo il kpi 62 (8d nuovi automotive)
  const automotive = await getKpi(tempo, AUTOMOTIVE);
  // prendo il kpi 63 (8d nuovi non automotive)
  const nonAutomotive = await getKpi(tempo, NON_AUTOMOTIVE);

  const valAuto = new Value.Builder().setLabel('Automotive').setData(automotive.toFixed(2)).build();
  const valNonAuto = new Value.Builder().setLabel('Non Automotive').setData(nonAutomotive.toFixed(2)).build();

  const valori = new Value.Builder().setLabel('').setData([valAuto, valNonAuto]).build();

  return {
    valueGroup: new ValueGroup.Builder().setLabel(tempo.label).setValori(valori).setTarget(target).build(),
    automotive,
    nonAutomotive
  };
}

async function getKpi(tempo, kpiNum) {
  const sql = `
    SELECT SUM(ifnull(val, 0)) as somma
    FROM tempo_mesi
    LEFT JOIN kpi_lab_qua ON tempo_mesi.anno = kpi_lab_qua.anno AND tempo_mesi.mese_num = kpi_lab_qua.mese 
    WHERE 
    kpi = :kpi AND 
    tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno
    GROUP BY tempo_mesi.trimestre`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { trimestre: tempo.trimestre, anno: tempo.anno, kpi: kpiNum },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].somma : 0;
  return val;
}
