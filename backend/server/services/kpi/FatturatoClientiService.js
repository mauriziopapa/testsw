/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const BudgetProgetti = require('../../models/bi/BudgetProgetti');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const { cliente, tipologia } = filters;

  const tempo = buildAnni(dal, al);

  const dataPromises = tempo.map((anno) => buildData(anno, cliente, tipologia));
  const datiKpi = await Promise.all(dataPromises);
  return datiKpi;
};

async function buildData(anno, cliente, tipologia) {
  const valori = [];
  const budget = await getBudget(anno, cliente);
  const nuoviProgettiBudget = await getNuoviBudgetProgetti(anno);

  if (cliente !== '-Tutti-') {
  if (tipologia === 'cli') {
    const fatturatoCliente = await getFatturatoCliente(anno, cliente);
    valori.push(new Value.Builder().setLabel('Fatturato Cliente').setData(fatturatoCliente).build());
    valori.push(new Value.Builder().setLabel('Budget Cliente').setData(budget).build());
  } else {
    const fatturatoTemprasud = await getFatturatoTemprasud(anno, cliente);
    const noteCredito = await getNoteCredito(anno, cliente);
    const fatturato = fatturatoTemprasud - noteCredito;

    valori.push(new Value.Builder().setLabel('Fatturato con Temprasud').setData(fatturato).build());
    valori.push(new Value.Builder().setLabel('Budget Cliente').setData(budget).build());
  }
}
  if(cliente === '-Tutti-') {
    const fatturatoTemprasud = await getFatturatoTemprasud(anno, cliente);
    const noteCredito = await getNoteCredito(anno, cliente);
    const fatturato = fatturatoTemprasud - noteCredito;
    valori.push(
      new Value.Builder().setLabel('Fatturato con Temprasud').setData(fatturato).build(),
      new Value.Builder().setLabel('Budget Cliente').setData(budget).build(),
      new Value.Builder().setLabel('Nuovi Progetti').setData(nuoviProgettiBudget).build(),
    );
  }
  return new ValueGroup.Builder().setLabel(anno).setValori(valori).build(); 
}

async function getFatturatoTemprasud(anno, cliente) {
  const query = `
  SELECT SUM(ifnull(Totale_Imponibile, 0)) AS fatturato
  FROM fatture_testate
  WHERE AnnoFattura = :anno 
    AND (CodiceCliente = :cliente OR "-Tutti-" = :cliente)
    AND CausaleMagazzino IN ('022', '11') `;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, cliente },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].fatturato : 0;
}

async function getNoteCredito(anno, cliente) {
  const query = `
  SELECT SUM(ifnull(Totale_Imponibile, 0)) AS fatturato
  FROM fatture_testate
  WHERE AnnoFattura = :anno 
    AND (CodiceCliente = :cliente OR "-Tutti-" = :cliente)
    AND CausaleMagazzino IN ('10')`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, cliente },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].fatturato : 0;
}

async function getFatturatoCliente(anno, cliente) {
  const query = `
  SELECT ifnull(fatturato_cliente, 0) AS fatt_cliente
  FROM riepilogo_clienti
  WHERE LPAD(cod_anagrafica, 6, '0') = :cliente 
  AND anno = :anno`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, cliente },
    type: QueryTypes.SELECT
  });

  return kpi.length > 0 ? kpi[0].fatturato : 0;
}

async function getBudget(anno, cliente) {
  let clientCondition = '';
  if (cliente !== '-Tutti-') {
    clientCondition = ` AND cod_anagrafica = "${cliente}" `;
  }

  const query = `
  SELECT
    ROUND(SUM(budget)) as budget
  FROM
    riepilogo_clienti rc
  WHERE
    anno = :anno
    ${clientCondition}`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  const { budget } = kpi[0];

  if (anno === 2022 && cliente === '-Tutti-') {
    return 5990968;
  }

  return budget;
}

async function getNuoviBudgetProgetti(anno) {
  const where = {
    where: { anno }
  };
  const budgetProgetti = await BudgetProgetti.findAll(where);
  if (
    budgetProgetti.length > 0 &&
    budgetProgetti[0].dataValues !== null &&
    budgetProgetti[0].dataValues !== undefined
  ) {
    return budgetProgetti[0].dataValues.budget;
  }
  return 0;
}
