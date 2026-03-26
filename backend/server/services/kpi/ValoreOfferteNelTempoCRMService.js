/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

module.exports.getKpiValues = async (filters) => {
  const { from, to, tipo_offerta, kpi_id } = filters;

  const dal = parseInt(from);
  const al = parseInt(to);
  const tempo = buildAnni(dal, al);

  const promises = tempo.map((anno) => buildData(anno, tipo_offerta, kpi_id));
  const results = await Promise.all(promises);
  return results;
};

async function buildData(year, tipo_offerta, kpi_id) {
  const promises = [];
  promises.push(TargetService.getTarget(year, kpi_id));
  // calcolo l'importo totale delle offerte
  promises.push(getKpi(year, tipo_offerta, false));
  // calcolo il l'importo totale delle offerte confermate
  promises.push(getKpi(year, tipo_offerta, true));
  const [target, total, confirmed] = await Promise.all(promises);

  const totalOffers = new Value.Builder().setLabel('Offerte').setData(total).build();
  const confirmedOffers = new Value.Builder().setLabel('Offerte OK').setData(confirmed).build();
  return new ValueGroup.Builder().setLabel(year).setValori([totalOffers, confirmedOffers]).setTarget(target).build();
}

async function getKpi(anno, tipo_offerta, confirmed) {
  const esito = confirmed ? " AND esito = 'OK' " : '';
  const sql = `
  SELECT 
    ifnull(SUM(ifnull(importo, 0)),0) as importo,
    tipo_offerta
  FROM offerte
  WHERE
    data_doc IS NOT NULL 
    AND YEAR(data_doc) = :anno
    AND tipo_offerta != 'AUMENTO'  
    AND (tipo_offerta = :tipo_offerta OR :tipo_offerta = '-Tutti-')
    ${esito}
  GROUP BY
    tipo_offerta`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tipo_offerta },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.tipo_offerta).setData(k.importo).build());
}
