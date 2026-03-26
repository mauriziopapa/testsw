/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (year) => {
  const results = await buildData(year);
  return results;
};

async function buildData(year) {
  const results = await getKpi(year);
  return [new ValueGroup.Builder().setLabel(year).setValori(results).build()];
}

async function getKpi(anno) {
  const sql = `
  SELECT
    fatturato as fatturato, 
    concorrenti_anag.nome_azienda as nome_azienda
  FROM concorrenti
    LEFT JOIN concorrenti_anag ON concorrenti.fk_azienda = concorrenti_anag.id
  WHERE anno = :anno 
  ORDER BY concorrenti_anag.id`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.nome_azienda).setData(k.fatturato).build());
}
