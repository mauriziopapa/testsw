/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const { capitalizeFirstLetter } = require('../../lib/utils');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiAreaValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { tipo_offerta, area } = filters;

  const datiKpi = await buildData(dal, al, area, tipo_offerta);
  return datiKpi;
};

async function buildData(dal, al, area, tipo_offerta) {
  const dalPrev1 = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrev1 = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const dalPrev2 = moment(dal).subtract(2, 'year').format(FORMAT_DATE);
  const alPrev2 = moment(al).subtract(2, 'year').format(FORMAT_DATE);

  const kpi = await Promise.all([
    getKpi(dal, al, area, tipo_offerta),
    getKpi(dalPrev1, alPrev1, area, tipo_offerta),
    getKpi(dalPrev2, alPrev2, area, tipo_offerta)
  ]);
  const valori = kpi.map((k, index) => {
    const label = `Periodo ${index > 0 ? `- ${index}y` : ''}`;
    const values = new Value.Builder().setLabel(capitalizeFirstLetter(area)).setData(k).build();
    return new ValueGroup.Builder().setLabel(label).setValori([values]).build();
  });
  // per far uscire l'ordine dal più vecchio al più recente
  valori.reverse();

  return valori;
}

async function getKpi(dal, al, area, tipo_offerta) {
  let kpi = [];
  switch (area) {
    case 'emissione':
      kpi = await getKpiTempoEmissione(dal, al, tipo_offerta);
      break;
    case 'chiusura':
      kpi = await getKpiPercChiusura(dal, al, tipo_offerta);
      break;
    default:
      break;
  }

  return kpi;
}

const getKpiTempoEmissione = async (dal, al, tipo_offerta) => {
  const sql = `
  SELECT ROUND(ifnull(AVG(lead_time),0),1) as avg
  FROM offerte
  WHERE
  data_doc IS NOT NULL 
  AND data_doc >= date(:dal) 
  AND data_doc <= LAST_DAY(:al) 
  AND tipo_offerta != 'AUMENTO' 
  AND (tipo_offerta = :tipo_offerta OR :tipo_offerta = '-Tutti-')`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  return kpi[0].avg ? kpi[0].avg : 0;
};

const getKpiPercChiusura = async (dal, al, tipo_offerta) => {
  let sql = `
  SELECT COUNT(id) as count
  FROM offerte
  WHERE
  data_doc IS NOT NULL 
  AND data_doc >= date(:dal) 
  AND data_doc <= LAST_DAY(:al) 
  AND tipo_offerta != 'AUMENTO' 
  AND (tipo_offerta = :tipo_offerta OR :tipo_offerta = '-Tutti-')`;

  const kpi_count = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  sql += " AND esito = 'OK' ";

  const kpi_chiuse = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  const totali = kpi_count[0].count ? kpi_count[0].count : 0;
  const chiuse = kpi_chiuse[0].count ? kpi_chiuse[0].count : 0;

  if (totali > 0) {
    return Math.round((chiuse / totali) * 100);
  }

  return 0;
};

module.exports.getKpiTempoEmissione = getKpiTempoEmissione;
module.exports.getKpiPercChiusura = getKpiPercChiusura;
