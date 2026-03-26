/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { buildMonthInterval } = require('../lib/time');
const ExcelManutenzioneGirata = require('../models/bi/ExcelManutenzioneGirata');

const { dbBi } = require('../lib/db');

module.exports.saveData = async (rows) => {
  const promises = rows.map((row) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    ExcelManutenzioneGirata.update(
      {
        val: row.val
      },
      {
        where: {
          id: row.id,
          anno: row.anno,
          mese: row.mese,
          fk_impianto: row.fk_impianto,
          impianto: row.impianto,
          tipologia: row.tipologia,
          foglio: row.foglio
        }
      }
    )
  );
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year, type) => {
  const anni = [year];
  const mesi = buildIntestazioneMesi(year);
  const valori = await getValori(year, type);
  const kpis = await getKpi(type);
  const impianti = await getImpianti(type);

  // raggruppo i valori per kpi
  const kpiRows = [];
  impianti.forEach((impianto) => {
    kpis.forEach((kpi) => {
      const row = { ...impianto };
      row.nome_kpi = `${impianto.nome_impianto} - ${kpi.nome_kpi}`;
      if (type === 'predittiva' && kpi.id === 40) {
        row.valori = valori.filter((v) => v.fk_impianto === impianto.id && v.tipologia === 'RITARDO');
      } else if (type === 'predittiva' && kpi.id === 41) {
        row.valori = valori.filter((v) => v.fk_impianto === impianto.id && v.tipologia === 'TOT');
      }

      if (type === 'programmata' && kpi.id === 42) {
        row.valori = valori.filter((v) => v.fk_impianto === impianto.id && v.tipologia === 'RITARDO');
      } else if (type === 'programmata' && kpi.id === 43) {
        row.valori = valori.filter((v) => v.fk_impianto === impianto.id && v.tipologia === 'TOT');
      }
      kpiRows.push(row);
    });
  });
  return { anni, mesi, kpi_rows: kpiRows };
};

async function getKpi(tipo) {
  let sql_kpi_where = '';
  if (tipo === 'predittiva') {
    sql_kpi_where = ' AND id IN (40, 41)';
  } else if (tipo === 'programmata') {
    sql_kpi_where = ' AND id IN (42, 43)';
  }
  const query = `SELECT * FROM kpi WHERE crud='manutenzione_pre_prog' ${sql_kpi_where} ORDER BY ordine`;
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getImpianti(tipo) {
  let sql_kpi_where = '';
  if (tipo === 'predittiva') {
    sql_kpi_where = ' AND predittiva = 1';
  } else if (tipo === 'programmata') {
    sql_kpi_where = ' AND programmata = 1';
  }
  const query = `SELECT * FROM impianti_man_anag WHERE 1 ${sql_kpi_where} ORDER BY ordine ASC`;
  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getValori(anno, tipo) {
  let sql_kpi_where = '';
  if (tipo === 'predittiva') {
    sql_kpi_where = ' AND foglio = "Predittiva"';
  } else if (tipo === 'programmata') {
    sql_kpi_where = ' AND foglio = "Programmata"';
  }

  const query = `
  SELECT
    excel_manutenzione_girata.*
  FROM
    excel_manutenzione_girata
  LEFT JOIN impianti_man_anag ON
    impianti_man_anag.id = excel_manutenzione_girata.fk_impianto
  WHERE
    anno = :anno
    ${sql_kpi_where}
    `;
  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });
  return kpi;
}

function buildIntestazioneMesi(anno) {
  const months = buildMonthInterval(`${anno}-01-01`, `${anno}-12-31`);
  return months.map((m) => ({ id_mese: parseInt(m.number), nome_mese: m.label }));
}
