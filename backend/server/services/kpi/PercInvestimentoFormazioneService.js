/* eslint-disable max-len */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);
  const { kpi_id } = filters;

  const tempo = buildAnni(dal, al);

  const resultDati = tempo.map((anno) => buildData(anno, kpi_id));
  const data = await Promise.all(resultDati);

  const currentYear = new Date().getFullYear();
  const formazione = await getFormazione(currentYear);
  const fatturato = await getKpi3(currentYear);
  const budget = await getBudget(currentYear);

  return { data, formazione, budget, fatturato };
};

async function buildData(anno, kpi_id) {
  const target = await TargetService.getTarget(anno, kpi_id);
  const kpi3 = await getKpi3(anno);
  const formazione = await getFormazione(anno);
  const budget = await getBudget(anno);
  let valFormFatt = 0;
  let valFormBudget = 0;
  if (kpi3 > 0) {
    valFormFatt = (formazione / kpi3) * 100;
  }
  if (budget > 0) {
    valFormBudget = (formazione / budget) * 100;
  }
  const kpiVal = new Value.Builder().setLabel('Inv Formazione').setData(valFormFatt.toFixed(2)).build();
  const budgetVal = new Value.Builder().setLabel('Budget').setData(valFormBudget.toFixed(2)).build();
  return new ValueGroup.Builder().setLabel(anno).setValori([kpiVal, budgetVal]).setTarget(target).build();
}

async function getKpi3(anno) {
  // prendo il fatturato
  const query = `
  SELECT sum(ifnull(Totale_Imponibile, 0)) as totale
  FROM tempo_mesi
  LEFT JOIN fatture_testate AS k ON tempo_mesi.mese_num = k.mese_num AND tempo_mesi.anno = k.AnnoFattura
  WHERE  
  tempo_mesi.anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].totale : 0;
}

async function getFormazione(anno) {
  const query = `
  SELECT SUM(ifnull(costo, 0)) as costo
  FROM tempo_mesi
  LEFT JOIN excel_formazione AS e ON tempo_mesi.mese_num = MONTH(e.data) 
    AND tempo_mesi.anno = YEAR(e.data) 
  WHERE tempo_mesi.anno = :anno `;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].costo : 0;
}

async function getBudget(anno) {
  const query = `
  SELECT 
    SUM(ifnull(if(budget > 0,budget, plan), 0)) AS budget
  FROM budget
  WHERE anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].budget : 0;
}
