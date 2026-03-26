/* eslint-disable camelcase */
const moment = require('moment');
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

module.exports.getDebugData = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { fornitore, rischio } = filters;
  let rischi = rischio;
  if (rischio === '-Tutti-') {
    rischi = ['A', 'B', 'C'];
  }

  const fornitoriByRischio = await FornitoriTSService.getFornitoriByRischio(rischi);

  const { ordiniEffettivi, leadTimeDays } = await retrieveOrdini(dal, al, fornitoriByRischio, fornitore);

  return { ordiniEffettivi, leadTimeDays };
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

  const valueGroup = data.map((d) =>
    new ValueGroup.Builder().setLabel(`Lead Time Medio ${d.label}`).setValori([d.value]).setTarget(target).build()
  );
  return valueGroup;
}

async function buildData(dal, al, fornitori, fornitore) {
  const dalAnno = moment(dal).year();
  const alAnno = moment(al).year();

  let label = `${dalAnno}-${alAnno}`;
  if (dalAnno === alAnno) {
    label = dalAnno;
  }

  const { leadTimeDays } = await retrieveOrdini(dal, al, fornitori, fornitore);

  const ritardoMedio = Math.round(average(leadTimeDays));
  const value = new Value.Builder().setLabel('Lead Time Medio').setData(ritardoMedio).build();
  return { value, label };
}

async function retrieveOrdini(dal, al, fornitori, fornitore) {
  const promises = [];
  promises.push(OrdiniFornitoriTSService.getOrdiniEvasi(dal, al, fornitore));
  promises.push(OrdiniMateriePrimeTSService.getOrdiniMateriePrimeEvasi(dal, al, fornitore));
  const [ordini, ordiniMP] = await Promise.all(promises);

  let fornitoriByRischio = fornitori;
  if (fornitore !== '-Tutti-') {
    fornitoriByRischio = fornitori.filter((f) => f.CodFornitore === parseInt(fornitore));
  }

  const orders = ordini.concat(ordiniMP);
  const filteredOrders = orders.filter((el) => fornitoriByRischio.some((f) => f.CodFornitore === el.IdFornitore));

  // Filtro per NumeroOrdine univoco perchè la query restituisce più righe
  const ordiniEffettivi = OrdiniFornitoriTSService.getOrdiniEffettivi(filteredOrders);
  const leadTimeDays = OrdiniFornitoriTSService.calculateLeadTimeDays(ordiniEffettivi);
  return { ordiniEffettivi, leadTimeDays };
}

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
