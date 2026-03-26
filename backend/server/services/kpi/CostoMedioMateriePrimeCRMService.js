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
  const { materia_prima, kpi_id } = filters;

  const tempo = buildAnni(dal, al);

  const resultDati = tempo.map((t) => buildData(t, materia_prima, kpi_id));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildData(anno, materiaPrima, kpi_id) {
  const promises = [];
  promises.push(TargetService.getTarget(anno, kpi_id));
  promises.push(getKpi(anno, materiaPrima));
  const [target, valori] = await Promise.all(promises);
  const value = new Value.Builder().setLabel('Aumento Ponderato').setData(valori).build();
  return new ValueGroup.Builder().setLabel(anno).setValori([value]).setTarget(target).build();
}

async function getKpi(anno, materiaPrima = '') {
  let prodotto = '';
  let fornitore = '';
  if (materiaPrima !== '-Tutti-') {
    [prodotto, fornitore] = materiaPrima.split('@');
  }
  const query_kpi = `
  SELECT 
    SUM(ifnull(r.variazione, 0)*IFNULL(r.totale,0)) AS num, 
    SUM(ifnull(r.totale,0)) AS den, 
    anno, 
    medio, 
    qta     
  FROM riepilogo_mp AS r
    LEFT JOIN prodotti_new ON r.prodotto = prodotti_new.idz 
  WHERE anno = :anno AND ('-Tutti-' = :materiaPrima OR (r.prodotto = :prodotto AND r.fornitore = :fornitore)) 
    AND prodotti_new.tipologia = 'Materia Prima'
  GROUP BY anno
  ORDER BY anno ASC`;

  const result = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno, materiaPrima, prodotto, fornitore },
    type: QueryTypes.SELECT
  });

  if (result.length === 0) {
    return 0;
  }

  return result[0].den > 0 ? (result[0].num / result[0].den).toFixed(2) : 0;
}
