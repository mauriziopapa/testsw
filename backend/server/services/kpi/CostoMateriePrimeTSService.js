/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');
const TargetService = require('./TargetService');
const MateriePrimeTSService = require('../MateriePrimeTSService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getDebugData = async (filters) => {
  const anno = new Date().getFullYear();
  const { materia_prima, rischio } = filters;
  let rischi = rischio;
  if (rischio === '-Tutti-') {
    rischi = ['A', 'B', 'C'];
  }

  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);
  let materiePrimeTrimmed = materiePrimeByRischio.map((mp) => mp.CodArticolo.trim());

  if (materia_prima !== '-Tutti-') {
    materiePrimeTrimmed = materiePrimeTrimmed.filter((mp) => mp === materia_prima);
  }

  if (materiePrimeTrimmed.length > 1) {
    const result = await getMoreKpiForDebug(anno, materiePrimeTrimmed);
    result.num = result.num.toFixed(2);
    result.den = result.den.toFixed(2);
    result.perc = result.den > 0 ? (result.num / result.den).toFixed(2) : 0;
    result.formula = 'SOMMA(variaz_perc_anno_prec * costo_totale) / costo_totale';
    return result;
  }

  const result = await getOneKpiForDebug(anno, materiePrimeTrimmed);
  result.variaz_perc_anno_prec = result.variaz_perc_anno_prec.toFixed(2);
  result.costo_totale = result.costo_totale.toFixed(2);
  result.perc = ((result.variaz_perc_anno_prec * result.costo_totale) / result.costo_totale).toFixed(2);
  result.formula = '(variaz_perc_anno_prec * costo_totale) / costo_totale';
  return result;
};

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);
  const { materia_prima, rischio, kpi_id } = filters;
  let rischi = rischio;
  if (rischio === '-Tutti-') {
    rischi = ['A', 'B', 'C'];
  }

  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);
  let materiePrimeTrimmed = materiePrimeByRischio.map((mp) => mp.CodArticolo.trim());

  if (materia_prima !== '-Tutti-') {
    materiePrimeTrimmed = materiePrimeTrimmed.filter((mp) => mp === materia_prima);
  }

  const tempo = buildAnni(dal, al);

  const resultDati = tempo.map((t) => buildData(t, materiePrimeTrimmed, kpi_id));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildData(anno, materiePrimeByRischio, kpi_id) {
  const promises = [];
  promises.push(TargetService.getTarget(anno, kpi_id));
  promises.push(getKpi(anno, materiePrimeByRischio));
  const [target, valori] = await Promise.all(promises);
  const value = new Value.Builder().setLabel('Var. Media Ponderata').setData(valori).build();
  return new ValueGroup.Builder().setLabel(anno).setValori([value]).setTarget(target).build();
}

async function getKpi(anno, materiaPrima = []) {
  const query = `
  SELECT
    SUM(ifnull(toma.variaz_perc_anno_prec, 0) * IFNULL(toma.costo_totale, 0)) AS num,
    SUM(ifnull(toma.costo_totale, 0)) AS den,
    anno
  FROM
    teamsystem_ordini_materieprime_annuale toma
  WHERE
    anno = :anno
    AND (toma.codice_articolo IN (:materiaPrima))
  GROUP BY
    anno
  ORDER BY
    anno ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, materiaPrima },
    type: QueryTypes.SELECT
  });

  if (result.length === 0) {
    return 0;
  }

  return result[0].den > 0 ? (result[0].num / result[0].den).toFixed(2) : 0;
}

async function getMoreKpiForDebug(anno, materiaPrima = []) {
  const query = `
  SELECT
    anno,
    SUM(ifnull(toma.variaz_perc_anno_prec, 0) * IFNULL(toma.costo_totale, 0)) AS num,
    SUM(ifnull(toma.costo_totale, 0)) AS den
  FROM
    teamsystem_ordini_materieprime_annuale toma
  WHERE
    anno = :anno
    AND (toma.codice_articolo IN (:materiaPrima))
  GROUP BY
    anno
  ORDER BY
    anno ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, materiaPrima },
    type: QueryTypes.SELECT
  });

  if (result.length === 0) {
    return 0;
  }

  return result.length > 0 ? result[0] : null;
}

async function getOneKpiForDebug(anno, materiaPrima = []) {
  const query = `
  SELECT
    anno,
    SUM(ifnull(toma.variaz_perc_anno_prec, 0)) AS variaz_perc_anno_prec,
    SUM(ifnull(toma.costo_totale, 0)) AS costo_totale
  FROM
    teamsystem_ordini_materieprime_annuale toma
  WHERE
    anno = :anno
    AND (toma.codice_articolo IN (:materiaPrima))
  GROUP BY
    anno
  ORDER BY
    anno ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, materiaPrima },
    type: QueryTypes.SELECT
  });

  return result.length > 0 ? result[0] : null;
}
