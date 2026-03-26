/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, getMonthIntervalFromTrimestre, getMonthNumbersFromTrimestre, buildAnni } = require('../../lib/time');
const TempoMesiService = require('./TempoMesiService');
const TargetService = require('./TargetService');

const ContatoreMetano = require('../../models/bi/ContatoreMetano');
const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getDebugData = async (filters) => {
  const { target, kpi_id } = filters;
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);
  

  let promises = [];
  promises.push(buildAnni(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  promises.push(getContatori());
  const [tempo, targetLevel, contatori] = await Promise.all(promises);

  promises = tempo.map((t) => buildDataDebug(dal, al, t, contatori, targetLevel));

  const results = await Promise.all(promises);
  return results;
};

module.exports.getKpiValues = async (filters) => {
  const { target, kpi_id } = filters;
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  // const yearFrom = `${dal}-01`;
  // const yearTo = `${al}-12`;

  let promises = [];
  promises.push(buildAnni(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  promises.push(getContatori());
  const [tempo, targetLevel, contatori] = await Promise.all(promises);

  promises = tempo.map((t) => buildData(dal, al, t, contatori, targetLevel));

  const results = await Promise.all(promises);
  return results;
};

async function getContatori() {
  return ContatoreMetano.findAll();
}

async function buildData(from, to,tempo, contatori, target) {
  const promises = contatori.map((contatore) => buildContatoreData(from, to, tempo, contatore));
  const results = await Promise.all(promises);
  const valueGroup = new Value.Builder().setLabel("").setData(results).build();
  return new ValueGroup.Builder().setLabel(tempo.toString()).setValori(valueGroup).setTarget(target).build();
}

async function buildContatoreData(from, to, tempo, contatore) {
  const kpi = await getKpi(from, to, tempo, contatore.id);
  return new Value.Builder().setLabel(`${contatore.codice} - ${contatore.nome}`).setData(kpi).build();
}

async function getKpi(dal, al, anno, id_contatore) {
  const sql = `
  SELECT
    id_contatore,
    nome_contatore,
    misurazione,
    SUM(kg_per_10_tonnellate) as kg_per_10_tonnellate
  FROM (
    SELECT DISTINCT 
      ml.id_contatore,
      ml.nome_contatore,
      (
      SELECT MAX(rp.misurazione)
      FROM contatori_misurazioni_metano rp
      where YEAR(rp.\`data\`) = :anno and id_contatore = :id_contatore
        ) as misurazione,
      (
      SELECT SUM(kg_prodotti_macroaree_da_commesse.kg_prodotti) / 100000 AS kg_per_10_tonnellate
      FROM kg_prodotti_macroaree_da_commesse
      LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree_da_commesse.macroarea
      WHERE anno = :anno and ml.reparto = macroaree.macroarea  
        ) as kg_per_10_tonnellate,
      ml.reparto
    FROM
      contatori_lavorazioni ml
    WHERE
      ml.id_contatore = :id_contatore
  ) q`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, anno, id_contatore },
    type: QueryTypes.SELECT
  });

  const { misurazione, kg_per_10_tonnellate } = kpi[0];

  if (kg_per_10_tonnellate > 0) {
    return (misurazione / (kg_per_10_tonnellate)).toFixed(2);
  }

  return 0;
}
async function buildDataDebug(from, to, tempo, contatori, target) {
  const promises = contatori.map((contatore) => buildContatoreDataDebug(from, to, tempo, contatore));
  const results = await Promise.all(promises);
  const valueGroup = new Value.Builder().setLabel("").setData(results).build();
  return new ValueGroup.Builder().setLabel(tempo.toString()).setValori(valueGroup).setTarget(target).build();
}

async function buildContatoreDataDebug(from, to, tempo, contatore) {
  const kpi = await getKpiDebug(from, to, tempo, contatore.id);
  return new Value.Builder().setLabel(`${contatore.codice} - ${contatore.nome}`).setData(kpi).build();
}

async function getKpiDebug(dal, al, anno, id_contatore) {
  const sql = `
    SELECT DISTINCT 
      ml.id_contatore,
      ml.nome_contatore,
      (
      SELECT MAX(rp.misurazione)
      FROM contatori_misurazioni_metano rp
      where YEAR(rp.\`data\`) BETWEEN :dal and :al and id_contatore = :id_contatore
        ) as misurazione,
      (
      SELECT SUM(kg_prodotti_macroaree_da_commesse.kg_prodotti) / 100 AS kg_per_10_tonnellate
      FROM kg_prodotti_macroaree_da_commesse
      LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree_da_commesse.macroarea
      WHERE anno = :anno and ml.reparto = macroaree.macroarea  
        ) as kg_per_10_tonnellate,
      ml.reparto
    FROM
      contatori_lavorazioni ml
    WHERE
      ml.id_contatore = :id_contatore`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, anno, id_contatore },
    type: QueryTypes.SELECT
  });

  let misurazione = 0;
  const kg_per_10_tonnellate = {};
  kpi.forEach((k) => {
    misurazione = k.misurazione;
    kg_per_10_tonnellate[k.reparto] = k.kg_per_10_tonnellate.toFixed(2);
  });

  return { misurazione, kg_per_10_tonnellate };
}
