/* eslint-disable max-len */
/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const tempo = [];
  tempo.push({ dal, al });
  for (let i = 1; i <= 1; i += 1) {
    const dalPrev = moment(dal).subtract(i, 'year').format(FORMAT_DATE);
    const alPrev = moment(al).subtract(i, 'year').format(FORMAT_DATE);
    tempo.push({ dal: dalPrev, al: alPrev });
  }
  // per far uscire l'ordine dal più vecchio al più recente
  tempo.reverse();

  let promises = [];
  const { macroarea } = filters;
  if (macroarea === '-Tutte-') {
    promises = tempo.map((t) => buildData(t.dal, t.al));
  } else {
    promises = tempo.map((t) => buildDataMacroarea(t.dal, t.al, macroarea));
  }

  const data = await Promise.all(promises);
  return data;
};

async function buildData(dal, al) {
  const label = moment(dal).year();
  const fatturato = await getFatturato(dal, al);

  const valoriFatt = new Value.Builder().setLabel('').setData(fatturato).build();
  return new ValueGroup.Builder().setLabel(label).setValori(valoriFatt).build();
}

async function buildDataMacroarea(dal, al, macroarea) {
  const label = moment(dal).year();
  const fatturato = await getFatturatoMacroarea(dal, al, macroarea);

  const valoriFatt = new Value.Builder().setLabel('').setData(fatturato).build();
  return new ValueGroup.Builder().setLabel(label).setValori(valoriFatt).build();
}

async function getFatturatoMacroarea(dal, al, macroarea) {
  const query = `
  SELECT  
    sum(ifnull(fatturato,0)) AS fatturato
  FROM fatturato_macroaree 
  WHERE date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)
    AND macroarea = :macroarea`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, macroarea },
    type: QueryTypes.SELECT
  });

  return new Value.Builder().setLabel('Fatturato').setData(kpi[0].fatturato.toFixed(2)).build();
}

async function getFatturato(dal, al) {
  const query = `
  SELECT  
    sum(ifnull(fatturato,0)) AS fatturato,
    m.macroarea as macroarea 
  FROM fatturato_macroaree fm, macroaree m 
  WHERE fm.macroarea = m.id
    AND date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)
  GROUP BY macroarea`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.macroarea).setData(k.fatturato.toFixed(2)).build());
}
