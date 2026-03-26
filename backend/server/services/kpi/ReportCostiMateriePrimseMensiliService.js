/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const excelCreator = require('../../lib/excel-creator');

const MateriePrimeTSService = require('../MateriePrimeTSService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COLUMN_WIDTH = 25;

module.exports.getReport = async (filters) => {
  const report = await getReport(filters.year, filters.month);

  const rischi = ['A', 'B'];
  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);

  const excelData = await buildExcelData(report, materiePrimeByRischio);

  const header = [
    new excelCreator.ExcelCell('Codice Prodotto', 'string'),
    new excelCreator.ExcelCell('Descrizione Materia Prima', 'string'),
    new excelCreator.ExcelCell('Rischio', 'string'),
    new excelCreator.ExcelCell('Anno', 'string'),
    new excelCreator.ExcelCell('Mese', 'string'),
    new excelCreator.ExcelCell('Importo Speso', 'string'),
    new excelCreator.ExcelCell('Quantità Acquistata', 'string'),
  ];

  const wb = excelCreator.create('Costi Materie Prime', header, excelData, COLUMN_WIDTH);
  return wb;
};

async function buildExcelData(report, materiePrimeByRischio) {
  const data = [];
  for (let i = 0; i < report.length; i += 1) {
    const mp = report[i];
    const el = materiePrimeByRischio.filter((row) => row.CodArticolo === mp.codice);

    if (el && el.length > 0) {
      const materiaPrima = [
        new excelCreator.ExcelCell(mp.codice, 'string'),
        new excelCreator.ExcelCell(mp.descrizione, 'string'),
        new excelCreator.ExcelCell(el[0].DesGruStat2, 'string'),
        new excelCreator.ExcelCell(mp.anno, 'number'),
        new excelCreator.ExcelCell(mp.mese, 'number'),
        new excelCreator.ExcelCell(mp.totale, 'number'),
        new excelCreator.ExcelCell(mp.quantita, 'number'),
      ];
      data.push(materiaPrima);
    }
  }

  return data;
}

async function getReport(anno, mese) {
  const sql = `
  SELECT DISTINCT 
    tm.CodArticolo as codice,
    tm.DesArticolo as descrizione,
    toma.anno as anno,
    toma.mese as mese,
    toma.quantita as quantita,
    toma.costo_totale as totale
  FROM
    teamsystem_ordini_materieprime_mensile toma,
    teamsystem_materieprime tm
  WHERE
    tm.CodArticolo = toma.codice_articolo
    AND (toma.anno * 100 + toma.mese) >= (:anno * 100 + :mese) - 100
    AND (toma.anno * 100 + toma.mese) <= (:anno * 100 + :mese)
  GROUP BY codice, anno, mese
  ORDER BY toma.anno DESC, toma.mese DESC, tm.DesArticolo ASC;`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese },
    type: QueryTypes.SELECT
  });

  return kpi;
}
