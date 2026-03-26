/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl, buildAnni } = require('../../lib/time');
const TempoMesiService = require('./TempoMesiService');
const TargetService = require('./TargetService');

const Contatore = require('../../models/bi/Contatore');
const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];
let {B1, B2, B3, B4} = {B1: 0, B2: 0, B3: 0, B4: 0};
const log = config.log();

// TODO Debug value con query con tutti e 3 i contatori

module.exports.getDebugData = async (filters) => {
  const { target, kpi_id } = filters;
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  let promises = [];
  promises.push(buildAnni(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  promises.push(getContatori());
  const [tempo, targetLevel, contatori] = await Promise.all(promises);

  promises = tempo.map((t) => buildDataDebug(dal, al, t, contatori, targetLevel));

  const results = await Promise.all(promises);
  return results;
};

module.exports.getKpiValues = async (filters) => {
  const { target, kpi_id } = filters;
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  let promises = [];
  promises.push(buildAnni(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  promises.push(getContatori());
  const [tempo, targetLevel, contatori] = await Promise.all(promises);

  promises = tempo.map((t) => buildData(dal, al, t, contatori, targetLevel));

  const results = await Promise.all(promises);
  return results;
};

async function getContatori() {
  return Contatore.findAll();
}

async function buildData(from, to, tempo, contatori, target) {
  const promises = contatori.map((contatore) => buildContatoreData(from, to, tempo, contatore));
  const results = await Promise.all(promises);
  const valueGroup = new Value.Builder().setLabel("").setData(results).build();
  return new ValueGroup.Builder().setLabel(tempo.toString()).setValori(valueGroup).setTarget(target).build();
}

async function buildContatoreData(from, to, tempo, contatore) {
  const kpi = await getKpi(from, to, tempo, contatore.id);
  return new Value.Builder().setLabel(`${contatore.codice} - ${contatore.nome}`).setData(kpi).build();
}


async function getKpi(dal, al, anno, id_contatore) {
  const contatoriArray = [1, 2, 3];
  const sql = `
  SELECT
    id_contatore,
    nome_contatore,
    misurazione,
    SUM(quintali_prodotti) / 100 as quintali_prodotti,
    quintali_prodotti_totali
  FROM (
    SELECT DISTINCT 
      ml.id_contatore,
      ml.nome_contatore,
      (
        SELECT MAX(rp.misurazione)
        FROM contatori_misurazioni rp
        WHERE YEAR(rp.\`data\`) = :anno and id_contatore = :id_contatore
      ) as misurazione,
      (
        SELECT SUM(kg_prodotti_macroaree_da_commesse.kg_prodotti) AS quintali_prodotti
        FROM kg_prodotti_macroaree_da_commesse
        LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree_da_commesse.macroarea
        WHERE anno = :anno AND ml.reparto = macroaree.macroarea  
      ) as quintali_prodotti,
      (
        SELECT SUM(kg_prodotti_macroaree_da_commesse.kg_prodotti) / 100 AS quintali_prodotti_totali
        FROM kg_prodotti_macroaree_da_commesse
        LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree_da_commesse.macroarea
        WHERE anno = :anno
      ) as quintali_prodotti_totali,
      ml.reparto
    FROM
      contatori_lavorazioni ml
    WHERE
      ml.id_contatore = :id_contatore
  ) q`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, anno, id_contatore },
    type: QueryTypes.SELECT
  });

  let { misurazione, quintali_prodotti, quintali_prodotti_totali } = kpi[0];
  quintali_prodotti = quintali_prodotti || 0;
  
  if (kpi.length === 0) {
    return { misurazione: 0, quintali_prodotti: 0 };
  }
  
  switch (id_contatore) {
    case 1:
      B1 = kpi[0]?.quintali_prodotti || 0;
      break;
    case 2:
      B2 = kpi[0]?.quintali_prodotti || 0;
      break;
    case 3:
      B3 = kpi[0]?.quintali_prodotti || 0;
      break;
    case 4:
      B4 = (kpi[0]?.quintali_prodotti / quintali_prodotti_totali) || 0;
      break;
    default:
      break;
  }

  if (quintali_prodotti > 0 && id_contatore == 4) {
    return ((misurazione / quintali_prodotti_totali)*10000).toFixed(2);
  }

  if (quintali_prodotti > 0) {
    return ((misurazione / quintali_prodotti) * 10000).toFixed(2);
  } else {
    return 0;
  }
}
async function buildDataDebug(from, to, tempo, contatori, target) {
  const promises = contatori.map((contatore) => buildContatoreDataDebug(from, to, tempo, contatore));
  const results = await Promise.all(promises);
  const valueGroup = new Value.Builder().setLabel("").setData(results).build();
  return new ValueGroup.Builder().setLabel(tempo.toString()).setValori(valueGroup).setTarget(target).build();
}

async function buildContatoreDataDebug(from, to, tempo, contatore) {
  const kpi = await getKpiDebug(from, to, tempo, contatore.id);
  return new Value.Builder().setLabel(`${contatore.codice} - ${contatore.nome}`).setData(kpi).build();
}

async function getKpiDebug(dal, al, anno, id_contatore) {
  const sql = `
    SELECT DISTINCT 
      ml.id_contatore,
      ml.nome_contatore,
      (
      SELECT MAX(rp.misurazione)
      FROM contatori_misurazioni rp
      where YEAR(rp.\`data\`) BETWEEN :dal and :al and id_contatore = :id_contatore
        ) as misurazione,
      (
      SELECT SUM(kg_prodotti_macroaree_da_commesse.kg_prodotti) / 100 AS quintali_prodotti
      FROM kg_prodotti_macroaree_da_commesse
      LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree_da_commesse.macroarea
      WHERE anno = :anno and ml.reparto = macroaree.macroarea  
        ) as quintali_prodotti,
      ml.reparto
    FROM
      contatori_lavorazioni ml
    WHERE
      ml.id_contatore = :id_contatore`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, anno, id_contatore },
    type: QueryTypes.SELECT
  });

  let misurazione = 0;
  const quintali_prodotti = {};
  kpi.forEach((k) => {
    misurazione = k.misurazione;
    quintali_prodotti[k.reparto] = k.quintali_prodotti.toFixed(2);
  });

  return { misurazione, quintali_prodotti };
}

/*
async function getKpi(dal, al, anno, mesi, id_contatore) {
  const sql = `
  SELECT DISTINCT 
    ml.id_contatore,
    ml.nome_contatore,
    (
      SELECT MAX(rp.misurazione)
      FROM contatori_misurazioni rp
      where rp.\`data\` BETWEEN :dal and :al and id_contatore = :id_contatore
    ) as misurazione,
    (
      SELECT SUM(kg_prodotti_macroaree.kg_prodotti) / 100 AS quintali_prodotti
      FROM kg_prodotti_macroaree
      LEFT JOIN macroaree ON macroaree.id = kg_prodotti_macroaree.macroarea
      WHERE anno = :anno and mese_num IN (:mesi)
    ) as quintali_prodotti
  FROM
    contatori_lavorazioni ml
  WHERE
    ml.id_contatore = :id_contatore`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal, al, anno, mesi, id_contatore },
    type: QueryTypes.SELECT
  });

  const { misurazione, quintali_prodotti } = kpi[0];

  if (quintali_prodotti > 0) {
    return (misurazione / quintali_prodotti).toFixed(2);
  }

  return 0;
}
*/
