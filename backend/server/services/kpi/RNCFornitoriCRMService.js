/* eslint-disable prefer-const */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const FORMAT_DATE = 'YYYY-MM-DD';

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { fornitore } = filters;

  const resultDati = await buildDataYear(dal, al, fornitore);
  return resultDati;
};

async function buildDataYear(dal, al, fornitore) {
  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  const dalPrec2 = moment(dal).subtract(2, 'year').format(FORMAT_DATE);
  const alPrec2 = moment(al).subtract(2, 'year').format(FORMAT_DATE);

  const years = [];
  years.push({ dal: dalPrec2, al: alPrec2 }, { dal: dalPrec, al: alPrec }, { dal, al });

  const promises = years.map((year) => buildData(year.dal, year.al, fornitore));
  const data = await Promise.all(promises);

  const valori = data.map((d) => d.value);
  const { ordiniTotali, nonConformi } = data[0];

  const valueGroup = [new ValueGroup.Builder().setLabel('% RNC').setValori(valori).build()];
  return { valueGroup, ordiniTotali, nonConformi };
}

async function buildData(dal, al, fornitore) {
  const dalAnno = moment(dal).year();
  const alAnno = moment(al).year();

  let label = `${dalAnno}-${alAnno}`;
  if (dalAnno === alAnno) {
    label = dalAnno;
  }

  const promises = [];
  promises.push(getOrdini(dal, al, fornitore));
  promises.push(getNonConformi(dal, al, fornitore));
  let [ordiniTotali, nonConformi] = await Promise.all(promises);

  const percScelto = (nonConformi / ordiniTotali) * 100;
  let value = new Value.Builder().setLabel(label).setData(percScelto.toFixed(2)).build();
  // forzatura daniel ticket 1250
  if (dalAnno === 2022 && alAnno === 2022) {
    value = new Value.Builder().setLabel(label).setData(0.6).build();
    ordiniTotali = 485;
    nonConformi = 3;
  }
  return { value, ordiniTotali, nonConformi };
}

async function getOrdini(dal, al, fornitore = '') {
  const query = `
  SELECT COUNT(*) AS totali
  FROM po 
  LEFT JOIN fornitori ON fornitori.id_crm = po.Vendor_id
  WHERE po.deleted = 0 AND po.Status != 'In Corso' 
  AND date(concat(LAST_DAY(concat(YEAR(po.PO_Date),'-',MONTH(po.PO_Date),'-01')))) >= date(:dal) 
  AND date(concat(YEAR(po.PO_Date), '-',MONTH(po.PO_Date), '-01')) <= date(:al)
  AND (po.Vendor_id = :fornitore OR :fornitore = '-Tutti-')
  AND monitora = 1`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, fornitore },
    type: QueryTypes.SELECT
  });

  return result[0].totali > 0 ? result[0].totali : 0;
}

async function getNonConformi(dal, al, fornitore = '') {
  const query = `
  SELECT COUNT(*) AS totali
  FROM po 
  LEFT JOIN fornitori ON fornitori.id_crm = po.Vendor_id
  WHERE po.deleted = 0 AND po.Status = 'Evaso con non conformità'
  AND date(concat(LAST_DAY(concat(YEAR(po.PO_Date),'-',MONTH(po.PO_Date),'-01')))) >= date(:dal) 
  AND date(concat(YEAR(po.PO_Date), '-',MONTH(po.PO_Date), '-01')) <= date(:al)
  AND (po.Vendor_id = :fornitore OR :fornitore = '-Tutti-')
  AND monitora = 1`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, fornitore },
    type: QueryTypes.SELECT
  });

  return result[0].totali > 0 ? result[0].totali : 0;
}
