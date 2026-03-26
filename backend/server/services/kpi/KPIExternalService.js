/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_EXTERNAL_AUTOMOTIVE = 60;
const KPI_EXTERNAL_NON_AUTOMOTIVE = 61;
const KPI_PEZZI_FATTURATI = 1;

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

  for (let i = tempo.length - 1; i >= 0; i -= 1) {
    const offset = i * 3;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );
    // Ottenere i dati KPI per le tre categorie
    const [dataExAuto, dataExNonAuto, dataPezziFatturati] = await Promise.all([
      Promise.all(newTempo.map((t) => getKpi(t, KPI_EXTERNAL_AUTOMOTIVE))),
      Promise.all(newTempo.map((t) => getKpi(t, KPI_EXTERNAL_NON_AUTOMOTIVE))),
      Promise.all(newTempo.map((t) => getKpi(t, KPI_PEZZI_FATTURATI)))
    ]);

    const calcExAuto = dataExAuto.map((currElement, index) =>
      dataPezziFatturati[index] > 0 ? (currElement / dataPezziFatturati[index]) * 1000000 : 0
    );
    const sumExAuto = calcExAuto.reduce((acc, value) => acc + value, 0);

    const calcExNonAuto = dataExNonAuto.map((currElement, index) =>
      dataPezziFatturati[index] > 0 ? (currElement / dataPezziFatturati[index]) * 1000000 : 0
    );
    const sumExNonAuto = calcExNonAuto.reduce((acc, value) => acc + value, 0);

    const totalSum = sumExAuto + sumExNonAuto;
    const average = totalSum / 4;

    movingWindow.push(average);
  }

  for (let i = 0; i < results.length; i += 1) {
    results[i].valueGroup.valori.data.push(
      new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build()
    );
  }

  return results.map((r) => r.valueGroup);
};

async function buildData(tempo, target) {
  let valAuto = 0;
  let valNonAuto = 0;

  // prendo il kpi 60 (kpi external automotive)
  const automotive = await getKpi(tempo, KPI_EXTERNAL_AUTOMOTIVE);
  // prendo il kpi 61 (kpi external non automotive)
  const nonAutomotive = await getKpi(tempo, KPI_EXTERNAL_NON_AUTOMOTIVE);
  // prendo il kpi 1
  const pezziFatturati = await getKpi(tempo, KPI_PEZZI_FATTURATI);

  if (pezziFatturati !== 0) {
    valAuto = (automotive / pezziFatturati) * 1000000;
    valNonAuto = (nonAutomotive / pezziFatturati) * 1000000;
  }

  const auto = new Value.Builder().setLabel('Automotive').setData(valAuto.toFixed(2)).build();
  const nonAuto = new Value.Builder().setLabel('NON Automotive').setData(valNonAuto.toFixed(2)).build();

  const valori = new Value.Builder().setLabel('').setData([auto, nonAuto]).build();

  return {
    valueGroup: new ValueGroup.Builder().setLabel(tempo.label).setValori(valori).setTarget(target).build(),
    automotive,
    nonAutomotive,
    pezziFatturati
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
