const { QueryTypes } = require('sequelize');
const KpiDirezione = require('../models/bi/KpiDirezione');

const { dbBi } = require('../lib/db');

module.exports.saveData = async (rows) => {
  const promises = rows.map((row) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    KpiDirezione.update(
      {
        val: row.val
      },
      {
        where: {
          id: row.id,
          anno: row.anno,
          sem: row.sem,
          kpi: row.kpi
        }
      }
    )
  );
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (dal, al) => {
  const anni = buildIntestazioneAnni(dal, al);
  const semestri = buildIntestazioneSemestri(dal, al);
  const valori = await getValori(anni);
  const kpis = await getKpi();

  // raggruppo i valori per kpi
  const kpiRows = [];
  kpis.forEach((kpi) => {
    const row = kpi;
    row.valori = valori.filter((v) => v.kpi === kpi.id);
    kpiRows.push(row);
  });
  return { anni, mesi: semestri, kpi_rows: kpiRows };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='direzione' ORDER BY ordine";
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getValori(anno) {
  return KpiDirezione.findAll({
    where: { anno },
    order: ['anno', 'sem', 'kpi']
  });
}

function buildIntestazioneAnni(dal, al) {
  const anni = [];
  for (let i = dal; i <= al; i += 1) {
    anni.push(i);
  }
  return anni;
}

function buildIntestazioneSemestri(dal, al) {
  const semestri = [];
  for (let i = dal; i <= al; i += 1) {
    // stesso oggetto per uniformarsi al frontend
    semestri.push({ id_mese: 1, nome_mese: 'I SEM' });
    semestri.push({ id_mese: 2, nome_mese: 'II SEM' });
  }
  return semestri;
}
