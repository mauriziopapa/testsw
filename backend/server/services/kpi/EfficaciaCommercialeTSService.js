/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, FORMAT_DATE } = require('../../lib/time');
const TargetService = require('./TargetService');
const EfficaciaCommercialeService = require('./EfficaciaCommercialeService');
const SezionaleOfferteService = require('../SezionaleOfferteTSService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiAreaValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { tipo_offerta, area, kpi_id } = filters;
  const inputTarget = filters.target;

  const target = await TargetService.getTarget(inputTarget, kpi_id);

  const datiKpi = await buildData(dal, al, area, tipo_offerta, target);
  return datiKpi;
};

async function buildData(dal, al, area, tipo_offerta, target) {
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
    const values = new Value.Builder().setLabel(kpiLabel(area)).setData(k).build();
    return new ValueGroup.Builder().setLabel(label).setValori([values]).setTarget(target).build();
  });
  // per far uscire l'ordine dal più vecchio al più recente
  valori.reverse();

  return valori;
}

async function getKpi(dal, al, area, tipo_offerta) {
  let kpi = [];
  const year = moment(al).year();
  if (year >= 2022) {
    kpi = await switchOnTeamSystem(area, dal, al, tipo_offerta);
  } else {
    kpi = await switchOnCRM(area, dal, al, tipo_offerta);
  }

  return kpi;
}

async function switchOnTeamSystem(area, dal, al, tipo_offerta) {
  let kpi = [];
  let tipo = { codice: tipo_offerta };
  if (tipo_offerta !== '-Tutti-') {
    tipo = await SezionaleOfferteService.findOneByDescrizione(tipo_offerta);
  }
  switch (area) {
    case 'emissione':
      kpi = await getKpiTempoEmissione(dal, al, tipo.codice);
      break;
    case 'chiusura':
      kpi = await getKpiPercChiusura(dal, al, tipo.codice);
      break;
    default:
      break;
  }
  return kpi;
}

async function switchOnCRM(area, dal, al, tipo_offerta) {
  let kpi = [];
  switch (area) {
    case 'emissione':
      kpi = await EfficaciaCommercialeService.getKpiTempoEmissione(dal, al, tipo_offerta);
      break;
    case 'chiusura':
      kpi = await EfficaciaCommercialeService.getKpiPercChiusura(dal, al, tipo_offerta);
      break;
    default:
      break;
  }
  return kpi;
}

async function getKpiTempoEmissione(dal, al, tipo_offerta) {
  const sql = `
  SELECT DataDocumento, DataRichiesta 
  FROM teamsystem_offerte 
  WHERE
    DataDocumento IS NOT NULL
    AND DataRichiesta IS NOT NULL
    AND DataDocumento >= date(:dal)
    AND DataDocumento <= LAST_DAY(:al)
    AND (RepartoOfferta  = :tipo_offerta OR :tipo_offerta = '-Tutti-')`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  const leadTimeDays = kpi.map((k) => moment(k.DataDocumento).diff(moment(k.DataRichiesta), 'days'));

  const tempoEmissione = leadTimeDays.length > 0 ? average(leadTimeDays) : 0;
  return tempoEmissione.toFixed(1);
}

async function getKpiPercChiusura(dal, al, tipo_offerta) {
  let sql = `
  SELECT COUNT(id) as count
  FROM teamsystem_offerte 
  WHERE
    DataDocumento IS NOT NULL
    AND DataDocumento >= date(:dal)
    AND DataDocumento <= LAST_DAY(:al)
    AND (RepartoOfferta  = :tipo_offerta OR :tipo_offerta = '-Tutti-')`;

  const kpi_count = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, tipo_offerta },
    type: QueryTypes.SELECT
  });

  sql += " AND Stato = 'ACCETTATA' ";

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
}

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

function kpiLabel(area) {
  let label = '';
  switch (area) {
    case 'emissione':
      label = 'Tempo di emissione';
      break;
    case 'chiusura':
      label = '% di chiusura';
      break;
    default:
      break;
  }
  return label;
}
