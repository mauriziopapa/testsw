/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const results = [];

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(inputTarget, 135));
  const [tempo, target] = await Promise.all(promises);

  for (let i = 0; i < tempo.length; i++) {
    const row = tempo[i];

    // prendo il kpi
    const val = await buildData(row.trimestre, row.anno);

    // prendo il kpi per l'anno precedente
    const annoPrec = parseInt(row.anno) - 1;
    const val_prec = await buildData(row.trimestre, annoPrec);

    results.push({
      label: row.label,
      val,
      val_prec,
      target
    });
  }

  return results;
};

async function buildData(trimestre, anno) {
  if (anno < 2021) {
    const sql = `
    SELECT COUNT(costi_extra_trasporti.id) as conteggio
    FROM tempo_mesi
    LEFT JOIN costi_extra_trasporti ON tempo_mesi.anno = YEAR(costi_extra_trasporti.data) 
      AND tempo_mesi.mese_num = MONTH(costi_extra_trasporti.data) 
    WHERE IFNULL(motivazione, '') != 'Produzione' AND
      tempo_mesi.trimestre = '${trimestre}' AND tempo_mesi.anno = ${anno}`;

    const kpi = await dbBi.sequelizeBi.query(sql, {
      type: QueryTypes.SELECT
    });

    const val = kpi.length > 0 ? kpi[0].conteggio : 0;
    return val;
  }

  const sql = `
    SELECT COUNT(*) as conteggio
    FROM commesse_nc 
    LEFT JOIN tempo ON tempo.\`data\` = commesse_nc.DataNC
    WHERE TipoNC = 8 AND trimestre = '${trimestre}' AND anno = ${anno}`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].conteggio : 0;
  return val;
}
