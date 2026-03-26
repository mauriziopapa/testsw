/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable newline-per-chained-call */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const FornitoriTSService = require('../FornitoriTSService');
const OrdiniFornitoriTSService = require('./OrdiniFornitoriTSService');
const OrdiniMateriePrimeTSService = require('./OrdiniMateriePrimeTSService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const FORMAT_DATE = 'YYYY-MM-DD';
const NC_ACQUISTI = 16;

module.exports.getDebugData = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { fornitore, rischio } = filters;
  let rischi = rischio;
  if (rischio === '-Tutti-') {
    rischi = ['A', 'B', 'C'];
  }

  const fornitoriByRischio = await FornitoriTSService.getFornitoriByRischio(rischi);
  const { ordiniEvasi, nonConformi } = await retrieveOrdini(dal, al, fornitoriByRischio, fornitore);
  return { ordini: ordiniEvasi, nonConformi };
};

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { fornitore, rischio, kpi_id } = filters;
  const inputTarget = filters.target;
  let rischi = rischio;
  if (rischio === '-Tutti-') {
    rischi = ['A', 'B', 'C'];
  }

  const promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  promises.push(FornitoriTSService.getFornitoriByRischio(rischi));
  const [target, fornitoriByRischio] = await Promise.all(promises);

  const resultDati = await buildDataYear(dal, al, fornitoriByRischio, fornitore, target);
  return resultDati;
};

async function buildDataYear(dal, al, fornitoriByRischio, fornitore, target) {
  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const dalPrec2 = moment(dal).subtract(2, 'year').format(FORMAT_DATE);
  const alPrec2 = moment(al).subtract(2, 'year').format(FORMAT_DATE);

  const years = [];
  years.push({ dal: dalPrec2, al: alPrec2 }, { dal: dalPrec, al: alPrec }, { dal, al });

  const promises = years.map((year) => buildData(year.dal, year.al, fornitoriByRischio, fornitore));
  const data = await Promise.all(promises);

  const { ordiniTotali, nonConformi } = data.length === 3 ? data[2] : { ordiniTotali: 0, nonConformi: 0 };

  const valueGroup = data.map((d) =>
    new ValueGroup.Builder().setLabel(`% RNC ${d.label}`).setValori([d.value]).setTarget(target).build()
  );

  return { valueGroup, ordiniTotali, nonConformi };
}

async function buildData(dal, al, fornitori, fornitore) {
  const dalAnno = moment(dal).year();
  const alAnno = moment(al).year();

  let label = `${dalAnno}-${alAnno}`;
  if (dalAnno === alAnno) {
    label = dalAnno;
  }

  const { ordiniEvasi, nonConformi } = await retrieveOrdini(dal, al, fornitori, fornitore);

  let percScelto = (nonConformi / ordiniEvasi.length) * 100;
  // Valori forzati a quelli del vecchio Sapere come da richiesta Temprasud
  if (dalAnno === 2021 && alAnno === 2021) {
    percScelto = 0.42;
  }
  if (dalAnno === 2020 && alAnno === 2020) {
    percScelto = 0.86;
  }
  const value = new Value.Builder().setLabel('% RNC').setData(percScelto.toFixed(2)).build();
  return { value, ordiniTotali: ordiniEvasi.length, nonConformi, label };
}

async function retrieveOrdini(dal, al, fornitori, fornitore) {
  const promises = [];
  promises.push(OrdiniFornitoriTSService.getOrdini(dal, al, fornitore));
  promises.push(OrdiniMateriePrimeTSService.getOrdiniMateriePrime(dal, al, fornitore));
  promises.push(getNonConformi(dal, al, fornitore));
  let [ordini, ordiniMP, nonConformi] = await Promise.all(promises);

  let fornitoriByRischio = fornitori;
  if (fornitore !== '-Tutti-') {
    fornitoriByRischio = fornitori.filter((f) => f.CodFornitore === parseInt(fornitore));
  }

  const orders = ordini.concat(ordiniMP);
  const filteredOrders = orders.filter((el) => fornitoriByRischio.some((f) => f.CodFornitore === el.IdFornitore));

  // Filtro per NumeroOrdine univoco perchè la query restituisce più righe
  const ordiniEffettivi = OrdiniFornitoriTSService.getOrdiniEffettivi(filteredOrders);
  const ordiniEvasi = ordiniEffettivi.filter((ordine) => ordine.DataEvasione != null);

  return { ordiniEvasi, nonConformi };
}

async function getNonConformi(dal, al, fornitore = '') {
  let conditionOrdini = '';
  let conditionOrdiniMp = '';
  if (fornitore !== '-Tutti-') {
    conditionOrdini = `AND tor.IdFornitore = ${fornitore}`;
    conditionOrdiniMp = `AND tom.IdFornitore = ${fornitore}`;
  }
  const sql = `
  SELECT DISTINCT
      tor.StatoOrdine as "StatoOrdine",
      tf.RagioneSociale as "RagioneSociale"
  FROM
    teamsystem_ordini tor,
    teamsystem_fornitori tf
  WHERE
    tor.StatoOrdine = "EVASO_CON_NON_CONFOR"
    AND tor.DataEvasione IS NOT NULL
    AND tor.DataOrdine BETWEEN :dal AND :al
    AND tor.IdFornitore = tf.CodiceFornitore 
    ${conditionOrdini}
  UNION ALL 
  SELECT
    DISTINCT
      tom.StatoOrdine as "StatoOrdine",
    tf.RagioneSociale as "RagioneSociale"
  FROM
    teamsystem_ordini_materieprime tom,
    teamsystem_fornitori tf
  WHERE
    tom.StatoOrdine = "EVASO_CON_NON_CONFOR"
    AND tom.DataEvasione IS NOT NULL
    AND tom.DataOrdine BETWEEN :dal AND :al
    AND tom.IdFornitore = tf.CodiceFornitore 
    ${conditionOrdiniMp}`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return kpi.length;
}
