const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const MateriaPrima = require('../../models/bi/MateriaPrima');
const TargetService = require('./TargetService');
const MateriePrimeService = require('../MateriePrimeService');

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

  // Recupera materie prime e target in parallelo
  const [materiePrime, targetLevel] = await Promise.all([
    getFilteredMateriePrime(),
    TargetService.getTarget(target, kpi_id),
  ]);

  // Recupera i dati KPI per il range di date
  const [previousTwoPeriodData,previousPeriodData, currentPeriodData] = await Promise.all([
    getKpiForPeriod(twoYearsAgoFromFormatted, twoYearsAgoToFormatted, materiePrime),
    getKpiForPeriod(previousDateFromFormatted, previousDateToFormatted, materiePrime),
    getKpiForPeriod(dal, al, materiePrime),
  ]);

  // Costruisce la struttura stacked
  const results = [
    buildStackedStructure(twoYearsAgoFromFormatted, twoYearsAgoToFormatted, previousTwoPeriodData, "Periodo - 2y", targetLevel),
    buildStackedStructure(previousDateFromFormatted, previousDateToFormatted, previousPeriodData,"Periodo - 1y", targetLevel),
    buildStackedStructure(dal, al, currentPeriodData,"Periodo" ,targetLevel),
  ];

  return results;
};

async function getFilteredMateriePrime() {
  const materiePrime = await MateriaPrima.findAll();
  return materiePrime.filter((mp) => mp.id !== 2 && mp.id !== 3); // Filtra esclusioni
}

async function getKpiForPeriod(from, to, materiePrime) {
  const promises = materiePrime.map(async (materiaPrima) => {
    const kpi = await getKpiSum(from, to, materiaPrima);
    return {
      nome: materiaPrima.nome,
      kpi,
    };
  });

  return Promise.all(promises);
}

function buildStackedStructure(from, to, kpiData, label, target) {
  const values = kpiData.map(({ nome, kpi }) => ({
    label: nome,
    data: kpi,
  }));

  return {
    label: label,
    valori: {
      label: '',
      data: values,
    },
    target,
  };
}

async function getKpiSum(from, to, materiaPrima) {
  const materiePrimeMapping = await MateriePrimeService.findAllMappingMateriePrimeWhere({
    id_materiaprima: materiaPrima.id,
  });

  let total = {
    quantita: 0,
    kgProdotti: 0,
  };

  for (const mp of materiePrimeMapping) {
    const ts = mp.teamsystem_materieprimes[0];
    const kpiData = await getKpi(from, to, materiaPrima.id, ts.CodArticolo);

    total.quantita += kpiData.quantita;
    total.kgProdotti = kpiData.kg_prodotti; // Si assume uguale per tutta la famiglia
  }

  if (total.kgProdotti > 0) {
    return (total.quantita / total.kgProdotti).toFixed(2);
  }

  return 0;
}

async function getKpi(from, to, idMateriaPrima, codMateriaPrimaTS) {
  const sql = `
    SELECT DISTINCT 
      (
        SELECT IFNULL(SUM(toma.QuantitaOrdinata), 0)
        FROM teamsystem_ordini_materieprime toma
        WHERE toma.DataOrdine BETWEEN :from AND :to AND toma.CodiceArticolo = :codMateriaPrimaTS
      ) as quantita,
      (
        SELECT SUM(kg_prodotti_macroaree.kg_prodotti) / 1000
        FROM kg_prodotti_macroaree
        WHERE CONCAT(kg_prodotti_macroaree.anno, '-', kg_prodotti_macroaree.mese_num) BETWEEN :from AND :to
      ) as kg_prodotti
    FROM materieprime_lavorazioni
    WHERE id_materiaprima = :idMateriaPrima
  `;

  const result = await dbBi.sequelizeBi.query(sql, {
    replacements: { from, to, codMateriaPrimaTS, idMateriaPrima },
    type: QueryTypes.SELECT,
  });

  return result[0] || { quantita: 0, kg_prodotti: 0 };
}
