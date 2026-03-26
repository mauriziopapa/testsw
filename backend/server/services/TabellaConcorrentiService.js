/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const Concorrente = require('../models/bi/Concorrente');
const ConcorrenteAnag = require('../models/bi/ConcorrenteAnag');

const { dbBi } = require('../lib/db');
const { buildAnni } = require('../lib/time');

module.exports.saveData = async (rows) => {
  const promises = rows.map((row) => updateKpi(row));
  const results = await Promise.all(promises);
  return results;
};

async function updateKpi(row) {
  const col = row.col_name;
  const query = `
    UPDATE concorrenti
    SET ${col} = :val
    WHERE id = :id AND anno = :anno AND cod_azienda = :cod_azienda;
  `;
  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { val: row.val, id: row.id, anno: row.anno, cod_azienda: row.cod_azienda },
    type: QueryTypes.UPDATE
  });
  return kpi;
}

module.exports.getData = async (dal, al) => {
  const anni = buildAnni(dal, al);
  const semestri = buildIntestazioneAnni(dal, al);
  const aziende = await getAziende();

  let promises = aziende.map((azienda) => getValori(anni, azienda.cod_azienda));
  const valori = await Promise.all(promises);

  promises = aziende.map(() => getKpi());
  const kpis = await Promise.all(promises);

  // raggruppo i valori per kpi
  const kpiRows = [];
  kpis.forEach((kpi, index) => {
    kpi.forEach((k) => {
      const row = k;
      row.azienda = valori[index][0].nome_azienda;
      row.valori = valori[index].map((v) => ({
        id: v.id,
        anno: v.anno,
        cod_azienda: v.cod_azienda,
        val: v.get(k.col_name),
        col_name: k.col_name
      }));
      kpiRows.push(row);
    });
  });

  return { anni: [], mesi: semestri, kpi_rows: kpiRows };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='concorrenti' ORDER BY ordine";
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getAziende() {
  return ConcorrenteAnag.findAll();
}

async function getValori(anno, cod_azienda) {
  return Concorrente.findAll({
    where: { anno, cod_azienda },
    order: ['cod_azienda', 'anno']
  });
}

function buildIntestazioneAnni(dal, al) {
  const anni = [];
  let id = 1;
  for (let i = dal; i <= al; i += 1) {
    // stesso oggetto per uniformarsi al frontend
    anni.push({ id_mese: id, nome_mese: i });
    id += 1;
  }
  return anni;
}
