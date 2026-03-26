/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const RepartiService = require('../RepartiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();

  const yearFrom = `${dal}-01`;
  const yearTo = `${al}-12`;
  const promises = [];
  promises.push(RepartiService.getReparti({ yearFrom, yearTo }));
  promises.push(getAnni(dal, al));
  promises.push(TargetService.getTarget(inputTarget, 124));
  const [reparti, tempo, target] = await Promise.all(promises);

  const repartiLabels = reparti.map((r) => r.reparto).concat('NCV');

  const resultDatiReparti = tempo.map((t) => buildDataReparto(t, target, repartiLabels));
  const datiCaricaReparto = await Promise.all(resultDatiReparti);

  return datiCaricaReparto;
};

async function buildDataReparto(tempo, target, reparti) {
  const dataPromises = reparti.map((reparto) => buildData(tempo, target, reparto));
  const dataValues = await Promise.all(dataPromises);
  const valori = dataValues.map((d) => new Value.Builder().setLabel(d.label).setData(d.resa).build());
  return new ValueGroup.Builder().setLabel(tempo.anno).setValori(valori).setTarget(target).build();
}

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM riepilogo_fornate
  WHERE anno >= :dal AND anno <= :al
  ORDER BY anno ASC`;

  const anni = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });
  return anni;
}

// Codice LEGACY
async function buildData(tempo, target, reparto) {
  const kpiValues = await getKpi(tempo, reparto);

  const result_tmp = { resa: 0, label: reparto };
  let num = 0;
  let den = 0;
  // ciclo sui cicli
  for (let i = 0; i < kpiValues.length; i++) {
    const r = kpiValues[i];
    if (r.p !== 0 && r.p * 100 < 99 && r.p * 100 > -99) {
      num += r.a * r.n * r.p * 100;
      den += r.a * r.n;
      result_tmp.ciclo = r.ciclo;
      result_tmp.p = r.p;
    }

    result_tmp.anno = tempo.anno;
    result_tmp.resa = 0;

    if (den !== 0) {
      result_tmp.resa = num / den;
    } else {
      result_tmp.resa = 0;
    }
    result_tmp.num = num;
    result_tmp.den = den;
    result_tmp.target = target;
    result_tmp.label = reparto;
  }

  return result_tmp;
}

async function getKpi(tempo, reparto) {
  const atmp = tempo.anno;
  const query_kpi = `
  SELECT 
    ciclo,
    IF(a_${atmp} = 0, NULL, a_${atmp}) AS a,
    IF(n_${atmp} = 0, NULL, n_${atmp}) AS n,
    p_${atmp}/1000 AS p
  FROM riepilogo_fornate_girata
  WHERE ciclo IN
    (
      SELECT DISTINCT ciclo 
      FROM riepilogo_fornate 
      WHERE anno = ${atmp} AND reparto = '${reparto}' 
            AND kg_fornate IS NOT NULL 
    )
    AND reparto = '${reparto}' `;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    type: QueryTypes.SELECT
  });
  return kpi;
}
