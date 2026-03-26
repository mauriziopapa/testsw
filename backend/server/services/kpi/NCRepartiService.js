/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const { capitalizeFirstLetter } = require('../../lib/utils');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const ID_AMBIENTE = 27;
const ID_LOGISTICA = 28;
const ID_MANUTENZIONE = 29;
const ID_QUALITA = 30;
const ID_SISTEMA = 31;
const ID_SICUREZZA = 43;
const ID_ACQUISTI = 65;
const ID_ESTERNA = 66;

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { kpi_id, target, tipologia } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, kpiTarget] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildAllData(t, kpiTarget, tipologia));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

module.exports.getKpiAreaValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { area, kpi_id, target } = filters;

  const promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, kpiTarget] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildData(t, area, kpiTarget));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function getSommaNC(tempo, kpi_num) {
  const { trimestre } = tempo;
  const { anno } = tempo;
  const sql = `
    SELECT SUM(ifnull(val, 0)) as somma
    FROM tempo_mesi
    LEFT JOIN kpi_lab_qua ON tempo_mesi.anno = kpi_lab_qua.anno AND tempo_mesi.mese_num = kpi_lab_qua.mese 
    WHERE 
    kpi IN (:kpi_num) AND 
    tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno 
    GROUP BY tempo_mesi.trimestre`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { kpi_num, trimestre, anno },
    type: QueryTypes.SELECT
  });

  const val = kpi.length > 0 ? kpi[0].somma : 0;
  return val;
}

async function buildAllData(tempo, target, tipologia) {
  const valori = [];
  const kpi_43_somma = await getSommaNC(tempo, ID_SICUREZZA);
  const kpi_27_somma = await getSommaNC(tempo, ID_AMBIENTE);
  const kpi_30_somma = await getSommaNC(tempo, ID_QUALITA);
  const kpi_31_somma = await getSommaNC(tempo, ID_SISTEMA);
  const kpi_28_somma = await getSommaNC(tempo, ID_LOGISTICA);
  const kpi_29_somma = await getSommaNC(tempo, ID_MANUTENZIONE);
  const kpi_65_somma = await getSommaNC(tempo, ID_ACQUISTI);
  const kpi_66_somma = await getSommaNC(tempo, ID_ESTERNA);
  const kpi_2_somma = await getKpi2Somma(tempo);

  if (kpi_2_somma !== 0 && tipologia === '-tutte-') {
    valori.push(
      new Value.Builder()
        .setLabel('Ambiente')
        .setData(((kpi_27_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Logistica')
        .setData(((kpi_28_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Manutenzione')
        .setData(((kpi_29_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Qualità')
        .setData(((kpi_30_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Di Sistema')
        .setData(((kpi_31_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Sicurezza')
        .setData(((kpi_43_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Acquisti')
        .setData(((kpi_65_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
    valori.push(
      new Value.Builder()
        .setLabel('Esterna')
        .setData(((kpi_66_somma / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
  } else if (kpi_2_somma !== 0 && tipologia !== '-tutte-') {
    const kpi = await getSommaNC(tempo, parseInt(tipologia));
    const label = getAreaFromId(tipologia);
    valori.push(
      new Value.Builder()
        .setLabel(label)
        .setData(((kpi / kpi_2_somma) * 100).toFixed(2))
        .build()
    );
  }

  const val = new Value.Builder().setLabel('').setData(valori).build();
  return new ValueGroup.Builder().setLabel(tempo.label).setValori(val).setTarget(target).build();
}

async function buildData(tempo, area, target) {
  let val = 0;

  const areObj = getArea(area);

  // prendo il kpi per area
  const kpi_somma = await getSommaNC(tempo, areObj.id);

  // prendo il kpi 2
  const kpi_2_somma = await getKpi2Somma(tempo);

  if (kpi_2_somma !== 0) {
    val = (kpi_somma / kpi_2_somma) * 100;
  }

  const valori = new Value.Builder().setLabel(areObj.label).setData(val).build();

  return new ValueGroup.Builder().setLabel(tempo.label).setValori([valori]).setTarget(target).build();
}

async function getKpi2Somma(tempo) {
  const sql_2 = `SELECT SUM(ifnull(val, 0)) as somma 
    FROM tempo_mesi LEFT JOIN kpi_lab_qua ON 
    tempo_mesi.anno = kpi_lab_qua.anno AND tempo_mesi.mese_num = kpi_lab_qua.mese 
    WHERE kpi = 2 
    AND tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno
    GROUP BY tempo_mesi.trimestre`;

  const kpi_2 = await dbBi.sequelizeBi.query(sql_2, {
    replacements: { trimestre: tempo.trimestre, anno: tempo.anno },
    type: QueryTypes.SELECT
  });

  const kpi_2_somma = kpi_2.length > 0 ? kpi_2[0].somma : 0;
  return kpi_2_somma;
}

function getArea(area) {
  const id = [];
  const label = capitalizeFirstLetter(area);
  switch (area) {
    case 'ambiente':
      id.push(27);
      break;
    case 'sicurezza':
      id.push(43);
      break;
    case 'qualità':
      id.push(28, 29, 30, 31, 65);
      break;
    default:
      break;
  }

  return { id, label };
}

function getAreaFromId(id) {
  switch (parseInt(id)) {
    case ID_AMBIENTE:
      return 'Ambiente';
    case ID_LOGISTICA:
      return 'Logistica';
    case ID_MANUTENZIONE:
      return 'Manutenzione';
    case ID_QUALITA:
      return 'Qualità';
    case ID_SISTEMA:
      return 'Di Sistema';
    case ID_SICUREZZA:
      return 'Sicurezza';
    case ID_ACQUISTI:
      return 'Acquisti';
    case ID_ESTERNA:
      return 'Esterna';
    default:
      return 'Motivazione Scelta';
  }
}

module.exports.getSommaNC = getSommaNC;
