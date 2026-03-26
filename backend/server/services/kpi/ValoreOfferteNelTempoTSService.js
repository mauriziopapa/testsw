/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildAnni } = require('../../lib/time');
const TargetService = require('./TargetService');
const SezionaleOfferteService = require('../SezionaleOfferteTSService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

module.exports.getKpiValues = async (filters) => {
  const { from, to, tipo_offerta, kpi_id } = filters;

  const tipiOfferte = await SezionaleOfferteService.findAll();

  const dal = parseInt(from);
  const al = parseInt(to);
  const tempo = buildAnni(dal, al);

  const promises = tempo.map((anno) => buildData(anno, tipo_offerta, tipiOfferte, kpi_id));
  const results = await Promise.all(promises);
  return results;
};

async function buildData(year, tipo_offerta, tipiOfferte, kpi_id) {
  const promises = [];
  promises.push(TargetService.getTarget(year, kpi_id));
  // calcolo l'importo totale delle offerte
  promises.push(getKpi(year, tipo_offerta, tipiOfferte, false));
  // calcolo il l'importo totale delle offerte confermate
  promises.push(getKpi(year, tipo_offerta, tipiOfferte, true));
  const [target, total, confirmed] = await Promise.all(promises);

  const totalOffers = new Value.Builder().setLabel('Offerte').setData(total).build();
  const confirmedOffers = new Value.Builder().setLabel('Offerte OK').setData(confirmed).build();
  return new ValueGroup.Builder().setLabel(year).setValori([totalOffers, confirmedOffers]).setTarget(target).build();
}

async function getKpi(anno, tipo_offerta, tipi_offerte, confirmed) {
  let tipo = tipo_offerta;
  if (tipo_offerta !== '-Tutti-') {
    tipo = tipi_offerte.filter((t) => t.descrizione === tipo_offerta)[0].codice;
  }

  const esito = confirmed ? " AND Stato = 'ACCETTATA' " : '';
  const sql = `
  SELECT 
    ifnull(SUM(ifnull(Importo , 0)),0) as importo,
    RepartoOfferta 
  FROM teamsystem_offerte
  WHERE
    DataDocumento  IS NOT NULL 
    AND YEAR(DataDocumento) = :anno
    AND RepartoOfferta != "00"
    AND (RepartoOfferta = :tipo OR :tipo = '-Tutti-')
    ${esito}
  GROUP BY
    RepartoOfferta`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, tipo },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) =>
    new Value.Builder().setLabel(findLabel(k.RepartoOfferta, tipi_offerte)).setData(k.importo).build()
  );
}

function findLabel(reparto, tipi_offerte) {
  const filtered = tipi_offerte.filter((t) => t.codice === reparto.trim());
  if (filtered.length > 0) {
    return filtered[0].descrizione;
  }
  return reparto;
}
