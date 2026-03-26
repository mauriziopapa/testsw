/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const mesi = await getMesiFromBudget(dal, al);

  const datiPrevisioneFatturato = {
    variazione: 0,
    fatturato_anno_corrente: 0,
    fatturato_anno_prec: 0
  };

  const datiKpi = [];
  for (let i = 0; i < mesi.length; i += 1) {
    const mese = mesi[i];
    // eslint-disable-next-line no-await-in-loop
    const dati = await buildData(mese, dal, al, datiPrevisioneFatturato);
    datiKpi.push(dati);
  }

  return datiKpi;
};

async function buildData(mese, dal, al, datiPrevisioneFatturato) {
  const promises = [];
  promises.push(getKpi(mese.mese_num, dal, al));
  const [valori] = await Promise.all(promises);
  // CODICE LEGACY
  const values = valori.map((v) => {
    let value;
    // Caso con fatturato presente (normale, mese gia passato)
    value = new Value.Builder().setLabel(`${v.label} ${v.anno}`).setData(v.fatturato).build();
    // Questo serve per stimare il fatturato futuro dell'anno in corso
    if (v.anno === new Date().getFullYear() && v.mese_num === new Date().getMonth() + 1 && v.label !== 'Budget') {
      // Mi trovo nel mese in corso, va calcolata la previsione se non sto calcolando il budget
      value = previsioneFatturato(mese, datiPrevisioneFatturato, v);
    } else if (v.fatt_mese === 0) {
      // Non c'è fatturato per questo mese, va calcolata la previsione
      value = previsioneFatturato(mese, datiPrevisioneFatturato, v);
    }

    // Aggiorno e sommo i dati sul fatturato in base all'anno, il fatturato da aggiungere è sempre fatt_mese dell'anno
    if (v.anno === new Date().getFullYear() - 1) {
      datiPrevisioneFatturato.fatturato_anno_prec += v.fatt_mese;
    } else if (v.anno === new Date().getFullYear() && v.label === 'Fatt Corrente') {
      datiPrevisioneFatturato.fatturato_anno_corrente += v.fatt_mese;
    }

    return value;
  });
  return new ValueGroup.Builder().setLabel(mese.mese_num).setValori(values).build();
}

async function getKpi(mese_num, dal, al) {
  const query = `
  SELECT 
    if(YEAR(NOW()) + 1 <= anno, plan_cum, fatturato_cum) AS fatturato, 
    if(YEAR(NOW()) + 1 <= anno, 'Plan', 'Fatt') AS label,
    if(YEAR(NOW()) + 1 <= anno, plan, fatturato) AS fatt_mese, 
    fatturato_prec,
    mese_num, 
    anno 
  FROM budget
  WHERE mese_num = :mese_num AND anno >= :dal AND anno <= :al  AND YEAR(NOW()) != anno
  UNION ALL
  SELECT
    fatturato_cum AS fatturato,
    'Fatt Corrente' AS label,
    fatturato AS fatt_mese,
    fatturato_prec,
    mese_num, 
    anno 
  FROM budget
  WHERE mese_num = :mese_num AND anno >= :dal AND anno <= :al  AND YEAR(NOW()) = anno
  UNION ALL
  SELECT
    budget_cum AS fatturato,
    'Budget' AS label,
    budget AS fatt_mese,
    0 AS fatturato_prec,
    mese_num, 
    anno 
  FROM budget
  WHERE mese_num = :mese_num AND anno >= :dal AND anno <= :al  AND YEAR(NOW()) = anno
  GROUP BY anno ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { mese_num, dal, al },
    type: QueryTypes.SELECT
  });

  return result;
}

async function getMesiFromBudget(dal, al) {
  const query = `
    SELECT DISTINCT mese_num
    FROM budget
    WHERE anno >= :dal AND anno <= :al
    ORDER BY mese_num ASC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });

  return result;
}

function previsioneFatturato(mese, datiPrevisioneFatturato, v) {
  const previsione = calcolaVariazione(datiPrevisioneFatturato, v.fatturato_prec);

  datiPrevisioneFatturato.variazione = previsione.variazione;
  datiPrevisioneFatturato.fatturato_anno_prec = previsione.fatturato_anno_prec;

  if (mese.mese_num === 12 && v.anno === 2021) {
    // Forzatura richiesta desk #1137
    return new Value.Builder().setLabel(`${v.label} ${v.anno}`).setData(4810866).build();
  }
  // Il fatturato corrente viene aumentato del fatturato precedente + la variazione calcolata
  datiPrevisioneFatturato.fatturato_anno_corrente +=
    v.fatturato_prec + v.fatturato_prec * datiPrevisioneFatturato.variazione;
  return new Value.Builder()
    .setLabel(`${v.label} ${v.anno}`)
    .setData(datiPrevisioneFatturato.fatturato_anno_corrente)
    .build();
}

function calcolaVariazione(datiPrevisioneFatturato, fatturato_prec) {
  // eslint-disable-next-line prefer-const
  let { variazione, fatturato_anno_corrente, fatturato_anno_prec } = datiPrevisioneFatturato;

  if (variazione === 0) {
    // E' il primo mese, non ho ancota calcolato la variazione
    // Ho già ciclato sull'anno precedente, rimuovo quindi dal calcolo del fatt_precedente il mese in corso
    // Ad es. se questo è nov dell'anno corrente ho già inserito il fatt del nov scorso -> lo devo togliere
    // eslint-disable-next-line no-param-reassign
    fatturato_anno_prec -= fatturato_prec;
    // Calcolo la variazione % del fatturato di quest'anno rispetto all'anno scorso
    // eslint-disable-next-line no-param-reassign
    variazione = (fatturato_anno_corrente - fatturato_anno_prec) / fatturato_anno_prec;
  }
  datiPrevisioneFatturato.variazione = variazione;
  datiPrevisioneFatturato.fatturato_anno_prec = fatturato_anno_prec;
  return datiPrevisioneFatturato;
}
