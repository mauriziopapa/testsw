/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const LIMITE_FATTURATO = 30000;

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
    ifnull(SUM(fatturato), 0) AS fatturato,
    descr_cdl as descr_cdl
  FROM fatturato_gruppi_cdl
  WHERE anno = :anno AND fatturato > 0
  GROUP BY descr_cdl
  ORDER BY fatturato ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  // Divido per fatturato oltre i 30k e aggrego i risultati
  const fattGrande = kpi.filter((k) => k.fatturato >= LIMITE_FATTURATO);
  const fattPiccolo = kpi
    .filter((k) => k.fatturato < LIMITE_FATTURATO)
    .map((k) => k.fatturato)
    .reduce((partialSum, a) => partialSum + a, 0);

  fattGrande.push({ descr_cdl: 'Altri impianti', fatturato: fattPiccolo });

  return fattGrande.map((k) => new Value.Builder().setLabel(k.descr_cdl).setData(k.fatturato).build());
}
