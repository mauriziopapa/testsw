/* eslint-disable no-param-reassign */
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
  const data = [];
  let nc_tot = 0;
  let gg_chiusura_sum = 0;
  let gg_chiusura_sum_auto = 0;
  let gg_chiusura_sum_nonauto = 0;

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { target, tipologia, kpi_id } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  for (let i = 0; i < tempo.length; i++) {
    const row = tempo[i];

    let kpi_automotive = [];
    let kpi_nonautomotive = [];
    if (tipologia === 'automotive') {
      // prendo il kpi (8d tempo chiusura automotive)
      kpi_automotive = await getKpi(row, 'SI');
    } else if (tipologia === 'non_automotive') {
      // prendo il kpi (8d tempo chiusura non automotive)
      kpi_nonautomotive = await getKpi(row, 'NO');
    } else {
      // prendo tutti (8d tempo chiusura)
      kpi_automotive = await getKpi(row, 'SI');
      kpi_nonautomotive = await getKpi(row, 'NO');
    }

    nc_tot += kpi_automotive.length > 0 ? kpi_automotive[0].conteggio : 0;
    gg_chiusura_sum += kpi_automotive.length > 0 ? kpi_automotive[0].tempochiusura_sum : 0;
    gg_chiusura_sum_auto += kpi_automotive.tempochiusura_sum;
    const automotive = kpi_automotive.length > 0 ? Math.round(kpi_automotive[0].tempochiusura_avg) : 0;

    nc_tot += kpi_nonautomotive.length > 0 ? kpi_nonautomotive[0].conteggio : 0;
    gg_chiusura_sum += kpi_nonautomotive.length > 0 ? kpi_nonautomotive[0].tempochiusura_sum : 0;
    gg_chiusura_sum_nonauto += kpi_nonautomotive.tempochiusura_sum;
    const non_automotive = kpi_nonautomotive.length > 0 ? Math.round(kpi_nonautomotive[0].tempochiusura_avg) : 0;

    data.push({
      label: row.label,
      automotive,
      non_automotive,
      target: targetLevel
    });
  }

  data.forEach((d) => {
    d.media = gg_chiusura_sum / nc_tot;
    d.media_auto = gg_chiusura_sum_auto / nc_tot;
    d.media_nonauto = gg_chiusura_sum_nonauto / nc_tot;
  });

  results.push({
    data,
    nc_tot,
    gg_chiusura_su: gg_chiusura_sum
  });

  return results;
};

async function getKpi(tempo, tipologia) {
  const tipologiaCondition = tipologia ? `AND nc_8d.automotive = '${tipologia}'` : '';
  const sql = `
    SELECT IFNULL(AVG(nc_8d.tempo_chiusura),0) as tempochiusura_avg, 
           IFNULL(COUNT(*), 0) as conteggio, 
           SUM(IFNULL(nc_8d.tempo_chiusura, 0)) as tempochiusura_sum
    FROM tempo_mesi
    LEFT JOIN nc_8d ON tempo_mesi.anno = YEAR(nc_8d.data_chiusura) AND tempo_mesi.mese_num = MONTH(nc_8d.data_chiusura)
    WHERE 
      tempo_mesi.trimestre = :trimestre 
      AND tempo_mesi.anno = :anno 
      ${tipologiaCondition}
      AND data_chiusura IS NOT NULL
    GROUP BY tempo_mesi.trimestre`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { trimestre: tempo.trimestre, anno: tempo.anno },
    type: QueryTypes.SELECT
  });
  return kpi;
}
