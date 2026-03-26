/* eslint-disable no-plusplus */
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

module.exports.getKpiValues = async (filters) => {
  const movingWindow = [];
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, kpi_id } = filters;

  // Recupera il tempo e il target
  let promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  // Costruisce i dati KPI iniziali
  promises = tempo.map((t) => buildData(t, targetLevel));
  let results = await Promise.all(promises);

  const ending = moment(al);

  // Calcola la media mobile
  for (let i = tempo.length - 1; i >= 0; i--) {
    const offset = i * 3;
    const endingMonth = ending.clone().subtract(offset, 'months');
    const startingMonth = endingMonth.clone().subtract(9, 'months');
    const newTempo = await TempoMesiService.getTempo(
      startingMonth.format(FORMAT_DATE),
      endingMonth.format(FORMAT_DATE)
    );

    const data = await Promise.all(newTempo.map((t) => getKpi({ anno: t.anno, trimestre: t.trimestre })));
    const flatData = data.flat();

    const calcValue = flatData.map((item) => item.costi / (item.provini > 0 ? item.provini : 1));
    const sumValue = calcValue.reduce((sum, value) => sum + value, 0);

    const average = calcValue.length > 0 ? sumValue / calcValue.length : 0;

    movingWindow.push(average);
  }

  // Aggiunge la media mobile ai risultati
  for (let i = 0; i < results.length; i++) {
    results[i].forEach((group) => {
      group.valori.push(new Value.Builder().setLabel('Media mobile').setData(movingWindow[i].toFixed(2)).build());
    });
  }

  return results.flat();
};

async function buildData(tempo, target) {
  const costiLab = await getKpi({ anno: tempo.anno, trimestre: tempo.trimestre });

  const kpiVal = costiLab.map((costo) => {
    let val = 0;
    if (costo.provini > 0) {
      val = costo.costi / costo.provini;
    }
    const valori = new Value.Builder().setLabel('Costo Laboratorio').setData(val.toFixed(2)).build();

    return new ValueGroup.Builder()
      .setLabel(`${tempo.trimestre} - ${tempo.anno}`)
      .setValori([valori])
      .setTarget(target)
      .build();
  });
  return kpiVal;
}

async function getKpi({ anno, trimestre }) {
  const sql = `
  SELECT *
  FROM costi_laboratorio
  WHERE anno = :anno AND trimestre = :trimestre`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, trimestre },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi : [];
}
