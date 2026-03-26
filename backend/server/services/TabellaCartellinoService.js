const { QueryTypes } = require('sequelize');
const { buildMonthInterval } = require('../lib/time');
const ExcelOreCartellino = require('../models/bi/ExcelOreCartellino');

const { dbBi } = require('../lib/db');

module.exports.saveData = async (rows) => {
  const promises = rows.map((row) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    ExcelOreCartellino.update(
      {
        ore: row.val
      },
      {
        where: {
          id: row.id,
          anno: row.anno,
          mese: row.mese
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
    row.valori = valori.map((v) => ({ id: v.id, anno: v.anno, mese: v.mese, val: v.ore }));
    kpiRows.push(row);
  });
  return { anni, mesi, kpi_rows: kpiRows };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='ore_cartellino' ORDER BY ordine";
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getValori(anno) {
  return ExcelOreCartellino.findAll({
    where: { anno },
    order: ['anno', 'mese']
  });
}

function buildIntestazioneMesi(anno) {
  const months = buildMonthInterval(`${anno}-01-01`, `${anno}-12-31`);
  return months.map((m) => ({ id_mese: parseInt(m.number), nome_mese: m.label }));
}
