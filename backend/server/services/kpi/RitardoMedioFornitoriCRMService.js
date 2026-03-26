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

  const valueGroup = [new ValueGroup.Builder().setLabel('Ritardo Medio').setValori(data).build()];
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
  promises.push(getKpi(dal, al, fornitore));
  const [ritMedio] = await Promise.all(promises);
  const value = new Value.Builder().setLabel(label).setData(ritMedio.toFixed(2)).build();
  return value;
}

async function getKpi(dal, al, fornitore = '') {
  const query = `
  SELECT 
  AVG(
      (
        SELECT COUNT(*)-1 
        FROM tempo 
        WHERE po.PO_Date <= tempo.\`data\` 
        AND tempo.\`data\` <= po.Data_evasione 
        AND weekday(tempo.\`data\`) < 5
      ) - r.lt
    ) AS rit_medio 
  FROM po_prodotti AS r
  LEFT JOIN po ON r.fk_po = po.id
  LEFT JOIN fornitori ON fornitori.id_crm = po.Vendor_id
  WHERE r.deleted = 0 AND po.deleted = 0 
    AND po.\`Status\` != 'In Corso' 
    AND date(concat(LAST_DAY(concat(YEAR(po.PO_Date),'-',MONTH(po.PO_Date),'-01')))) >= date(:dal) 
    AND date(concat(YEAR(po.PO_Date), '-',MONTH(po.PO_Date), '-01')) <= date(:al) 
    AND (po.Vendor_id = :fornitore OR :fornitore = '-Tutti-')
    AND fornitori.monitora = 1 
    AND r.lt > 0`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, fornitore },
    type: QueryTypes.SELECT
  });

  const ritMedio = result.map((r) => (r.rit_medio == null ? 0 : r.rit_medio));

  return ritMedio.length > 0 ? Math.round(ritMedio[0]) : 0;
}
