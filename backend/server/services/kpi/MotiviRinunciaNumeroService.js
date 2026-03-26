/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

module.exports.getKpiValues = async (filters) => {
  let { year, tipo_offerta } = filters;
  if (year > 2022) {
    year = '2022';
  }
  const prevYear = parseInt(year) - 1;
  const promises = [prevYear, year].map((anno) => buildData(anno, tipo_offerta));
  const results = await Promise.all(promises);
  return results;
};

async function buildData(year, tipo_offerta) {
  const results = await getKpi(year, tipo_offerta);
  const valori = new Value.Builder().setLabel('').setData(results).build();
  return new ValueGroup.Builder().setLabel(year).setValori(valori).build();
}

async function getKpi(anno, tipo_offerta) {
  const sql = `
  SELECT 
  ifnull(motivazione_rinuncia, IF(Quote_Stage = 'Stand by', 'stand by', 'Non specificato')) as motivazione, 
  count(*) as numero
  FROM offerte
  WHERE YEAR(data_doc) = :anno AND (esito NOT LIKE '%ok%' OR esito IS NULL OR Quote_Stage = 'Stand by') AND 
      (Quote_Stage != 'Inviata' OR Quote_Stage IS NULL) AND 
    (tipo_offerta = :tipo_offerta OR :tipo_offerta = '-Tutti-')
    AND tipo_offerta != 'AUMENTO' 
  GROUP BY motivazione
  ORDER BY numero DESC`;

  let kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tipo_offerta },
    type: QueryTypes.SELECT
  });

  if (anno === '2022') {
    kpi = kpi
      .map((k) => mapMotivazione(k))
      .concat(
        {
          motivazione: 'Non specificato',
          numero: 0
        },
        {
          motivazione: 'Progetto modificato',
          numero: 0
        }
      );
  }

  return kpi.map((k) => new Value.Builder().setLabel(k.motivazione).setData(k.numero).build());
}

function mapMotivazione(kpi) {
  switch (kpi.motivazione) {
    case 'NA NON PRODOTTI':
      kpi.motivazione = 'Non prodotti';
      break;
    case 'STAND BY':
      kpi.motivazione = 'stand by';
      break;
    case 'NA PREZZO ALTO':
      kpi.motivazione = 'Quotazione troppo alta';
      break;
    default:
      kpi.motivazione = 'Non specificato';
      break;
  }
  return kpi;
}
