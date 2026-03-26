/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const MotiviRinunciaService = require('./MotiviRinunciaService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

module.exports.getKpiValues = async (filters) => {
  const { from, to, tipo_offerta } = filters;
  const { dal, al } = buildDalAl(from, to);
  const prevYearFrom = new Date(dal);
  prevYearFrom.setFullYear(prevYearFrom.getFullYear() - 1);
  const prevYearTo = new Date(al);
  prevYearTo.setFullYear(prevYearTo.getFullYear() - 1);

  const formatDate = (date) => date.toISOString().split('T')[0];
  const prevYearFromFormatted = formatDate(prevYearFrom);
  const prevYearToFormatted = formatDate(prevYearTo);
  const results = await Promise.all([
    buildData(dal, al, tipo_offerta),
    buildData(prevYearFromFormatted, prevYearToFormatted, tipo_offerta)
  ]);
  return results;
};

async function buildData(from, to, tipo_offerta) {
  const results = await getKpi(from, to, tipo_offerta);
  const valori = new Value.Builder().setLabel('').setData(results).build();
  return new ValueGroup.Builder().setLabel(`${from} - ${to}`).setValori(valori).build();
}

async function getKpi(dal, al, tipo_offerta) {
  const sql = `
  SELECT
    Stato as motivazione,
    ROUND(SUM(Importo), 2) as valore
  FROM
    teamsystem_offerte
  WHERE
    DataDocumento BETWEEN :dal AND :al
    AND Stato != 'ACCETTATA'
    AND 
      (RepartoOfferta = :tipo_offerta
      OR :tipo_offerta = '-Tutti-')
  GROUP BY
    motivazione
  ORDER BY
    motivazione DESC`;

  let kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    kpi = await MotiviRinunciaService.getDefaultValuesTeamSystem('valore');
  }

  return kpi.map((k) => new Value.Builder().setLabel(k.motivazione).setData(k.valore).build());
}
