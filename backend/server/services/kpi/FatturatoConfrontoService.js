/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE, FORMAT_DATEMONTH } = require('../../lib/time');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const tempo = [];
  tempo.push({ dal, al });
  for (let i = 1; i <= 3; i += 1) {
    const dalPrev = moment(dal).subtract(i, 'year').format(FORMAT_DATE);
    const alPrev = moment(al).subtract(i, 'year').format(FORMAT_DATE);
    tempo.push({ dal: dalPrev, al: alPrev });
  }
  // per far uscire l'ordine dal più vecchio al più recente
  tempo.reverse();

  const dalPrev = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrev = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  let fatturato = 0;
  let fatturato_prec = 0;
  let budget = 0;
  let promises = [];
  const { cliente } = filters;
  if (cliente === '-Tutti-') {
    promises = tempo.map((t) => buildData(t.dal, t.al));
    fatturato = await getFatturato(dal, al);
    fatturato_prec = await getFatturato(dalPrev, alPrev);
    budget = await getBudget(dal, al);
  } else {
    promises = tempo.map((t) => buildDataClient(t.dal, t.al, cliente));
    fatturato = await getFatturatoCliente(dal, al, cliente);
    fatturato_prec = await getFatturatoCliente(dalPrev, alPrev, cliente);
    budget = await getBudget(dal, al);
  }

  const data = await Promise.all(promises);

  return { data, fatturato, fatturato_prec, budget };
};

async function buildDataClient(dal, al, client) {
  const label = moment(dal).year();
  const dalPrev = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrev = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  let fatturato = await getFatturatoCliente(dal, al, client);
  const fatturatoPrec = await getFatturatoCliente(dalPrev, alPrev, client);
  const nc = await getNcCliente(dal, al, client);
  const budget = await getBudgetCliente(dal, al, client);

  fatturato -= nc;
  let percBudget = 0;
  let percFatturato = 0;
  if (budget > 0) {
    percBudget = ((fatturato - budget) / budget) * 100;
  }
  if (fatturatoPrec > 0) {
    percFatturato = ((fatturato - fatturatoPrec) / fatturatoPrec) * 100;
  }

  const valoriBudget = new Value.Builder().setLabel('% Budget').setData(percBudget.toFixed(2)).build();
  const valoriFatturato = new Value.Builder().setLabel('% Fatturato Prec').setData(percFatturato.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(label).setValori([valoriBudget, valoriFatturato]).build();
}

async function buildData(dal, al) {
  const label = moment(dal).year();
  const dalPrev = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrev = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const fatturato = await getFatturato(dal, al);
  const fatturatoPrec = await getFatturato(dalPrev, alPrev);
  const budget = await getBudget(dal, al);

  let percBudget = 0;
  let percFatturato = 0;
  if (budget > 0) {
    percBudget = ((fatturato - budget) / budget) * 100;
  }
  if (fatturatoPrec > 0) {
    percFatturato = ((fatturato - fatturatoPrec) / fatturatoPrec) * 100;
  }

  const valoriBudget = new Value.Builder().setLabel('% Budget').setData(percBudget.toFixed(2)).build();
  const valoriFatturato = new Value.Builder().setLabel('% Fatturato Prec').setData(percFatturato.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(label).setValori([valoriBudget, valoriFatturato]).build();
}

async function getFatturato(dal, al) {
  const query = `
  SELECT  
    sum(ifnull(fatturato,0)) AS fatturato
  FROM budget
  WHERE
    date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return kpi[0].fatturato;
}

async function getBudget(dal, al) {
  const query = `
  SELECT  
    sum(ifnull(budget, 0)) AS budget
  FROM budget 
  WHERE
    date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  if (moment(dal).year() === 2022 || moment(al).year() === 2022) {
    const mese = moment(al).month() + 1; // i mesi partono da 0
    return ((5990968 / 12) * mese).toFixed(2);
  }

  return kpi[0].budget;
}

async function getFatturatoCliente(dal, al, cliente) {
  const query = `
  SELECT  
    sum(ifnull(Totale_Imponibile,0)) AS fatturato
  FROM fatture_testate
  WHERE
    date(concat(LAST_DAY(concat(AnnoFattura,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(AnnoFattura, '-',mese_num, '-01')) <= date(:al)
    AND CodiceCliente = :cliente
    AND CausaleMagazzino IN ('022', '11')`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, cliente },
    type: QueryTypes.SELECT
  });

  return kpi[0].fatturato;
}

async function getNcCliente(dal, al, cliente) {
  const query = `
  SELECT  
    sum(ifnull(Totale_Imponibile,0)) AS fatturato
  FROM fatture_testate
  WHERE
    date(concat(LAST_DAY(concat(AnnoFattura,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(AnnoFattura, '-',mese_num, '-01')) <= date(:al)
    AND CodiceCliente = :cliente
    AND CausaleMagazzino IN ('10')`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, cliente },
    type: QueryTypes.SELECT
  });

  return kpi[0].fatturato;
}

async function getBudgetCliente(dal, al, cliente) {
  const dalYm = moment(dal).format(FORMAT_DATEMONTH);
  const alYm = moment(al).format(FORMAT_DATEMONTH);
  const annoDa = moment(dal).year();
  const annoA = moment(al).year();
  const query = `
  SELECT  
    sum(ifnull(budget, 0)) AS budget,
    period_diff(:alYm, :dalYm)+1 AS mesi 
  FROM riepilogo_clienti 
  WHERE
    LPAD(cod_anagrafica, 6, '0') = :cliente 
    AND anno >= :annoDa AND anno <= :annoA`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { alYm, dalYm, cliente, annoDa, annoA },
    type: QueryTypes.SELECT
  });

  return (kpi[0].budget * kpi[0].mesi) / 12;
}

async function getFatturatoKpi(dal, al) {
  const query = `
  SELECT  
    sum(ifnull(fatturato,0)) AS fatturato
  FROM budget
  WHERE
    date(concat(LAST_DAY(concat(anno,'-',mese_num,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese_num, '-01')) <= date(:al)`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return kpi[0].fatturato;
}
