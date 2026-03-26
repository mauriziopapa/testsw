/* eslint-disable max-len */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const tempo = buildAnni(dal, al);

  const dataPromises = tempo.map((anno) => buildData(anno));
  const datiKpi = await Promise.all(dataPromises);
  return datiKpi;
};

async function buildData(anno) {
  const valori = await getKpi(anno);
  return new ValueGroup.Builder().setLabel(anno).setValori(valori).build();
}

async function getKpi(anno) {
  let fatturato = new Value.Builder().setLabel('Fatturato').setData(0).build();
  let budget = new Value.Builder().setLabel('Budget').setData(0).build();

  const query = `
  SELECT 
    SUM(ifnull(fatturato, 0)) AS fatturato, 
    SUM(ifnull(if(anno >= YEAR(NOW()) + 1, plan, budget), 0)) AS budget 
  FROM budget
  WHERE anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  if (kpi.length > 0) {
    fatturato = new Value.Builder().setLabel('Fatturato').setData(kpi[0].fatturato).build();
    budget = new Value.Builder().setLabel('Budget').setData(kpi[0].budget).build();
  }

  // Forzatura chiesta da Gilda per 2022, provato ad impostare su db ma veniva sovrascritto ogni notte
  if (anno === 2022) {
    budget = new Value.Builder().setLabel('Budget').setData(5990968).build();
  }

  return [budget, fatturato];
}
