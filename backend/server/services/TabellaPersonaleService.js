const { QueryTypes } = require('sequelize');
const { buildMonthInterval } = require('../lib/time');
const KpiPersonale = require('../models/bi/KpiPersonale');

const { dbBi } = require('../lib/db');

module.exports.saveData = async (rows) => {
  const promises = rows.map((row) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    KpiPersonale.update(
      {
        val: row.val,
        forzatura_manuale: row.forzatura_manuale
      },
      {
        where: {
          id: row.id,
          anno: row.anno,
          mese: row.mese,
          kpi: row.kpi
        }
      }
    )
  );
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year) => {
  const anni = [year];
  const mesi = buildIntestazioneMesi(year);
  const valori = await getValori(year);
  const kpis = await getKpi();

  // raggruppo i valori per kpi
  const kpiRows = [];
  kpis.forEach((kpi) => {
    const row = kpi;
    row.valori = valori.filter((v) => v.kpi === kpi.id);
    kpiRows.push(row);
  });
  return { anni, mesi, kpi_rows: kpiRows };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='personale' ORDER BY ordine";
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getValori(anno) {
  return KpiPersonale.findAll({
    where: { anno },
    order: ['anno', 'mese', 'kpi']
  });
}

function buildIntestazioneMesi(anno) {
  const months = buildMonthInterval(`${anno}-01-01`, `${anno}-12-31`);
  return months.map((m) => ({ id_mese: parseInt(m.number), nome_mese: m.label }));
}
