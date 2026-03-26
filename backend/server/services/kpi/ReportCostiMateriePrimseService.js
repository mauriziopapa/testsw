/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const excelCreator = require('../../lib/excel-creator');

const MateriePrimeTSService = require('../MateriePrimeTSService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COLUMN_WIDTH = 25;

module.exports.getReport = async () => {
  const yearFrom = new Date().getFullYear();
  const yearTo = new Date().getFullYear() - 2;

  const report = await getReport(yearFrom, yearTo);

  const rischi = ['A', 'B'];
  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);

  const excelData = await buildExcelData(report, materiePrimeByRischio);

  const header = [
    new excelCreator.ExcelCell('Codice Prodotto', 'string'),
    new excelCreator.ExcelCell('Descrizione Materia Prima', 'string'),
    new excelCreator.ExcelCell('Rischio', 'string'),
    new excelCreator.ExcelCell('Anno', 'string'),
    new excelCreator.ExcelCell('Importo Speso', 'string'),
    new excelCreator.ExcelCell('Quantità Acquistata', 'string'),
    new excelCreator.ExcelCell('Costo Unitario', 'string'),
    new excelCreator.ExcelCell('% Aumento Anno Precedente', 'string')
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
        new excelCreator.ExcelCell(mp.totale, 'number'),
        new excelCreator.ExcelCell(mp.quantita, 'number'),
        new excelCreator.ExcelCell(mp.costo_unitario, 'number'),
        new excelCreator.ExcelCell(mp.variazione / 100, 'percentage') // Perchè dal DB arriva già in percentuale
      ];
      data.push(materiaPrima);
    }
  }

  return data;
}

async function getReport(yearFrom, yearTo) {
  const sql = `
  SELECT DISTINCT 
    tm.CodArticolo as codice,
    tm.DesArticolo as descrizione,
    toma.anno as anno,
    toma.quantita as quantita,
    toma.costo_totale as totale,
    toma.costo_unitario as costo_unitario,
    toma.variaz_perc_anno_prec as variazione
  FROM
    teamsystem_ordini_materieprime_annuale toma,
    teamsystem_materieprime tm
  WHERE
    tm.CodArticolo = toma.codice_articolo
    AND anno <= :yearFrom AND anno >= :yearTo
  ORDER BY anno DESC, descrizione ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { yearFrom, yearTo },
    type: QueryTypes.SELECT
  });

  return kpi;
}
