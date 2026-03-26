/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const MotiviRinunciaService = require('./MotiviRinunciaService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

module.exports.getKpiValues = async (filters) => {
  const { year, tipo_offerta } = filters;
  const prevYear = parseInt(year) - 1;
  const promises = [prevYear, year].map((anno) => buildData(anno, tipo_offerta));
  const results = await Promise.all(promises);
  return results;
};

async function buildData(year, tipo_offerta) {
  const results = await getKpi(year, tipo_offerta);
  const valori = new Value.Builder().setLabel('').setData(results).build();
  return new ValueGroup.Builder().setLabel(year).setValori(valori).build();
}

async function getKpi(anno, tipo_offerta) {
  const sql = `
  SELECT
    Stato as motivazione,
    count(*) as numero
  FROM
    teamsystem_offerte
  WHERE
    YEAR(DataDocumento) = :anno
    AND Stato != 'ACCETTATA'
    AND 
      (RepartoOfferta = :tipo_offerta
      OR :tipo_offerta = '-Tutti-')
  GROUP BY
    motivazione
  ORDER BY
    motivazione DESC`;

  let kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tipo_offerta },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    kpi = await MotiviRinunciaService.getDefaultValuesTeamSystem('numero');
  }

  return kpi.map((k) => new Value.Builder().setLabel(k.motivazione).setData(k.numero).build());
}
