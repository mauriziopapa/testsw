/* eslint-disable max-len */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const ValueGroup = require('../../models/response/ValueGroup');
const Value = require('../../models/response/Value');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();
const KPI5 = 5;
const KPI6 = 6;
const KPI7 = 7;

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const year = parseInt(filters.year);
  const inputTarget = filters.target;
  const kpiId = filters.kpi_id;

  let promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpiId));
  const [target] = await Promise.all(promises);

  const anni = [year - 1, year];
  if (year < 2022) {
    const reparti = ['LLF', 'IND'];
    promises = anni.map((anno) => buildYear(reparti, anno, target));
  } else {
    const reparti = ['LLF', 'NCV Cieffe', 'NCV Ipsen', 'TV', 'IND'];
    promises = anni.map((anno) => buildYear(reparti, anno, target));
  }

  const dataValues = await Promise.all(promises);
  dataValues.map((d) => results.push(d));
  return results;
};

async function buildYear(reparti, anno, target) {
  if (anno < 2022) {
    // eslint-disable-next-line no-param-reassign
    reparti = ['LLF', 'IND'];
  }
  const promises = reparti.map((reparto) => buildData(reparto, anno));
  const results = await Promise.all(promises);
  return new ValueGroup.Builder().setLabel(anno).setValori(results).setTarget(target).build();
}

async function buildData(reparto, anno) {
  const values = [];
  let perc5 = 0;
  let perc6 = 0;
  let perc7 = 0;

  const valori = await Promise.all([
    getKpi(reparto, anno, KPI5),
    getKpi(reparto, anno, KPI6),
    getKpi(reparto, anno, KPI7)
  ]);

  let kpi5 = 0;
  let kpi6 = 0;
  let kpi7 = 0;
  if (valori.length > 0 && valori[0].length > 0) {
    kpi5 = valori[0][0].val ? valori[0][0].val : 0;
    kpi6 = valori[1][0].val ? valori[1][0].val : 0;
    kpi7 = valori[2][0].val ? valori[2][0].val : 0;
  }
  const tot = kpi5 + kpi6 + kpi7;

  if (tot > 0) {
    perc5 = (kpi5 / tot) * 100;
    perc6 = (kpi6 / tot) * 100;
    perc7 = (kpi7 / tot) * 100;
  }

  values.push(
    new Value.Builder().setLabel('% h spento per Man.Programmata/preventiva').setData(perc5.toFixed(2)).build()
  );
  values.push(
    new Value.Builder().setLabel('% h spento per Man.Straordinaria/guasto').setData(perc6.toFixed(2)).build()
  );
  values.push(
    new Value.Builder().setLabel('% h stand-by per Man.Straordinaria/guasto').setData(perc7.toFixed(2)).build()
  );

  return new Value.Builder().setLabel(reparto).setData(values).build();
}

async function getKpi(reparto, anno, kpi) {
  let query = `
      SELECT SUM(ifnull(val, 0)) AS val, kpi
      FROM kpi_produzione
      WHERE 
        kpi = :kpi AND 
        anno = :anno AND reparto = :reparto
  `;

  if (anno >= 2023) {
    query = `
    SELECT SUM(ifnull(valore, 0)) AS val, fk_kpi as kpi
    FROM impianti_crud 
    WHERE 
    fk_kpi  = :kpi AND 
    anno = :anno AND fk_impianto in (SELECT id FROM impianti_anag ia WHERE gruppo_impianto = :reparto)
  `;
  }

  const values = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, reparto, kpi },
    type: QueryTypes.SELECT
  });
  return values;
}
