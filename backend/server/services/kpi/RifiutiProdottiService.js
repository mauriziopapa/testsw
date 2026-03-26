/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const { buildDalAl } = require('../../lib/time');
const Rifiuto = require('../../models/bi/Rifiuto');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { from, to, target, kpi_id } = filters;
  const { dal, al } = buildDalAl(from, to);
  // Calcola le date per il periodo precedente
  const previousDateFrom = new Date(dal);
  previousDateFrom.setFullYear(previousDateFrom.getFullYear() - 1);
  const previousDateTo = new Date(al);
  previousDateTo.setFullYear(previousDateTo.getFullYear() - 1);
  const formatDate = (date) => date.toISOString().split('T')[0];
  const previousDateFromFormatted = formatDate(previousDateFrom);
  const previousDateToFormatted = formatDate(previousDateTo);

  // Calcola le date per due anni fa
  const twoYearsAgoFrom = new Date(dal);
  twoYearsAgoFrom.setFullYear(twoYearsAgoFrom.getFullYear() - 2);
  const twoYearsAgoTo = new Date(al);
  twoYearsAgoTo.setFullYear(twoYearsAgoTo.getFullYear() - 2);
  const twoYearsAgoFromFormatted = formatDate(twoYearsAgoFrom);
  const twoYearsAgoToFormatted = formatDate(twoYearsAgoTo);

  // Recupera rifiuti e target in parallelo
  const [rifiuti, targetLevel] = await Promise.all([
    getRifiuti(),
    TargetService.getTarget(target, kpi_id),
  ]);

  // Recupera i dati KPI per il range di date
  const [previousTwoYearsData,previousYearData,currentYearData] = await Promise.all([
    getKpiForPeriod(twoYearsAgoFromFormatted, twoYearsAgoToFormatted, rifiuti),
    getKpiForPeriod(previousDateFromFormatted, previousDateToFormatted, rifiuti),
    getKpiForPeriod(dal, al, rifiuti),
  ]);

  // Costruisci la struttura richiesta
  const results = [
    buildStackedStructure("Periodo - 2y", previousTwoYearsData, targetLevel),
    buildStackedStructure("Periodo - 1y", previousYearData, targetLevel),
    buildStackedStructure("Periodo", currentYearData, targetLevel),
  ];

  return results;
};

// Funzione per recuperare tutti i rifiuti
async function getRifiuti() {
  return Rifiuto.findAll();
}

// Funzione per ottenere i KPI di un anno specifico
async function getKpiForPeriod(from, to, rifiuti) {
  const promises = rifiuti.map(async (rifiuto) => {
    const kpi = await getKpi(from, to, rifiuto.id);
    return {
      nome: rifiuto.nome,
      kpi,
    };
  });

  return Promise.all(promises);
}

// Funzione per costruire la struttura richiesta
function buildStackedStructure(label, kpiData, target) {
  const values = kpiData.map(({ nome, kpi }) => ({
    label: nome,
    data: kpi,
  }));

  return {
    label: label.toString(),
    valori: {
      label: "",
      data: values,
    },
    target,
  };
}

// Funzione per calcolare il KPI di un singolo rifiuto in un anno
async function getKpi(from, to, id_rifiuto) {
  const sql = `
    SELECT DISTINCT 
      ml.id_rifiuto,
      ml.nome_rifiuto,
      (
        SELECT SUM(rp.quantita)
        FROM rifiuti_prodotti rp
        WHERE rp.data BETWEEN :from AND :to AND id_rifiuto = :id_rifiuto
      ) AS quantita,
      (
        SELECT SUM(kg_prodotti_macroaree.kg_prodotti) / 100 AS quintali_prodotti
        FROM kg_prodotti_macroaree
        LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree.macroarea
        WHERE CONCAT(kg_prodotti_macroaree.anno, '-', kg_prodotti_macroaree.mese_num) BETWEEN :from AND :to
      ) AS quintali_prodotti
    FROM
      rifiuti_lavorazioni ml
    WHERE
      ml.id_rifiuto = :id_rifiuto`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to, id_rifiuto },
    type: QueryTypes.SELECT,
  });

  if (kpi.length > 0) {
    const { quantita, quintali_prodotti } = kpi[0];
    if (quintali_prodotti > 0) {
      return (quantita / quintali_prodotti).toFixed(2);
    }
  }

  return 0;
}
