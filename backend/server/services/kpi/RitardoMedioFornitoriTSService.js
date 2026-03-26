/* eslint-disable camelcase */
const moment = require('moment');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const OrdiniFornitoriTSService = require('./OrdiniFornitoriTSService');
const OrdiniMateriePrimeTSService = require('./OrdiniMateriePrimeTSService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const FORMAT_DATE = 'YYYY-MM-DD';

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { fornitore, kpi_id } = filters;
  const inputTarget = filters.target;

  const promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [target] = await Promise.all(promises);

  const resultDati = await buildDataYear(dal, al, fornitore, target);
  return resultDati;
};

async function buildDataYear(dal, al, fornitore, target) {
  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const dalPrec2 = moment(dal).subtract(2, 'year').format(FORMAT_DATE);
  const alPrec2 = moment(al).subtract(2, 'year').format(FORMAT_DATE);

  const years = [];
  years.push({ dal: dalPrec2, al: alPrec2 }, { dal: dalPrec, al: alPrec }, { dal, al });

  const promises = years.map((year) => buildData(year.dal, year.al, fornitore));
  const data = await Promise.all(promises);

  const valueGroup = data.map((d) =>
    new ValueGroup.Builder().setLabel(`Ritardo Medio ${d.label}`).setValori([d.value]).setTarget(target).build()
  );
  return valueGroup;
}

async function buildData(dal, al, fornitore) {
  const dalAnno = moment(dal).year();
  const alAnno = moment(al).year();

  let label = `${dalAnno}-${alAnno}`;
  if (dalAnno === alAnno) {
    label = dalAnno;
  }

  const promises = [];
  promises.push(OrdiniFornitoriTSService.getOrdiniEvasi(dal, al, fornitore));
  promises.push(OrdiniMateriePrimeTSService.getOrdiniMateriePrimeEvasi(dal, al, fornitore));
  const [ordini, ordiniMP] = await Promise.all(promises);

  // Filtro per NumeroOrdine univoco perchè la query restituisce più righe
  const ordiniEffettivi = OrdiniFornitoriTSService.getOrdiniEffettivi(ordini.concat(ordiniMP));
  const delay = OrdiniFornitoriTSService.calculateDelayDays(ordiniEffettivi);
  const ritardoMedio = Math.round(average(delay));
  const value = new Value.Builder().setLabel('Ritardo Medio').setData(ritardoMedio).build();
  return { value, label };
}

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
