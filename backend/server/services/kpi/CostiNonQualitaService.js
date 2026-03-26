/* eslint-disable camelcase */
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

const COSTI_NON_AUTOMIVE = 52;
const COSTI_AUTOMOTIVE = 53;
const FATTURATO = 3;

module.exports.getKpiValues = async (filters) => {
  const movingWindow = [];
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
    // Ottenere i dati KPI per le tre categorie
    const [dataAuto, dataNonAuto, dataFatturato] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpi(t, COSTI_AUTOMOTIVE))),
      Promise.all(newTempo.map((t) => getKpi(t, COSTI_NON_AUTOMIVE))),
      Promise.all(newTempo.map((t) => getKpi(t, FATTURATO)))
    ]);

    const calcAuto = dataAuto.map((currElement, index) =>
      dataFatturato[index] > 0 ? currElement / dataFatturato[index] : 0
    );
    const sumAuto = calcAuto.reduce((sum, value) => sum + value, 0);

    const calcNonAuto = dataNonAuto.map((currElement, index) =>
      dataFatturato[index] > 0 ? currElement / dataFatturato[index] : 0
    );
    const sumNonAuto = calcNonAuto.reduce((sum, value) => sum + value, 0);

    const average = sumAuto >= 0 && sumNonAuto >= 0 ? ((sumAuto + sumNonAuto) / 4) * 100 : 0;

    movingWindow.push(average);
  }

  for (let i = 0; i < results.length; i++) {
    results[i].valueGroup.valori.data.push(
      new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build()
    );
  }

  return results.map((r) => r.valueGroup);
};

async function buildData(tempo, target) {
  let valAuto = 0;
  let valNonAuto = 0;

  // prendo il kpi 52
  const nonAutomotive = await getKpi(tempo, COSTI_NON_AUTOMIVE);
  // prendo il kpi 53
  const automotive = await getKpi(tempo, COSTI_AUTOMOTIVE);
  // prendo il kpi 3
  const fatturato = await getKpi(tempo, FATTURATO);

  if (fatturato !== 0) {
    valAuto = (automotive / fatturato) * 100;
    valNonAuto = (nonAutomotive / fatturato) * 100;
  }

  const auto = new Value.Builder().setLabel('Automotive').setData(valAuto.toFixed(2)).build();
  const nonAuto = new Value.Builder().setLabel('NON Automotive').setData(valNonAuto.toFixed(2)).build();

  const valori = new Value.Builder().setLabel('').setData([auto, nonAuto]).build();

  return {
    valueGroup: new ValueGroup.Builder().setLabel(tempo.label).setValori(valori).setTarget(target).build(),
    automotive,
    nonAutomotive,
    fatturato
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
