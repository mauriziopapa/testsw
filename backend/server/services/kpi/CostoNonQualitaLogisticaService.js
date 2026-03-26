/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');
const CostoNonQualitaService = require('./CostoNonQualitaService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const NC_LOGISTICA = 8;

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, inputTarget] = await Promise.all(promises);

  const dataPromises = tempo.map((t) => buildData(t, inputTarget));
  const results = await Promise.all(dataPromises);
  return results;
};

async function buildData(tempo, target) {
  const val = await getKpi(tempo.trimestre, tempo.anno);

  // prendo il kpi per l'anno precedente
  const annoPrec = parseInt(tempo.anno) - 1;
  const val_prec = await getKpi(tempo.trimestre, annoPrec);

  return {
    label: tempo.label,
    val,
    val_prec,
    target
  };
}

async function getKpi(trimestre, anno) {
  if (anno < 2021) {
    const sql = `
    SELECT SUM(IFNULL(importo_fatturato, 0)) as somma
    FROM tempo_mesi
    LEFT JOIN costi_extra_trasporti AS e ON tempo_mesi.mese_num = MONTH(e.data) AND tempo_mesi.anno = YEAR(e.data)
    WHERE tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno`;

    const kpi = await dbBi.sequelizeBi.query(sql, {
      replacements: { trimestre, anno },
      type: QueryTypes.SELECT
    });

    const val = kpi.length > 0 ? kpi[0].somma : 0;
    return val;
  }

  return CostoNonQualitaService.getCostoNC(anno, trimestre, NC_LOGISTICA);
}
