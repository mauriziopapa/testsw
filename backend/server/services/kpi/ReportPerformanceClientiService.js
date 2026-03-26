const ReportPerformanceCliente = require('../../models/bi/ReportPerformanceCliente');

const excelCreator = require('../../lib/excel-creator');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COLUMN_WIDTH = 20;

module.exports.getReport = async () => {
  const year = new Date().getFullYear();
  const yearPrec = new Date().getFullYear() - 1;

  const clienti = await ReportPerformanceCliente.findAll();

  const excelData = buildExcelData(clienti);

  const header = [
    new excelCreator.ExcelCell('Codice Anagrafica', 'string'),
    new excelCreator.ExcelCell('Cliente', 'string'),
    new excelCreator.ExcelCell(`Fatturato ${year}`, 'string'),
    new excelCreator.ExcelCell(`Fatturato ${yearPrec}`, 'string'),
    new excelCreator.ExcelCell('Variazione %', 'string'),
    new excelCreator.ExcelCell('LT Medio', 'string'),
    new excelCreator.ExcelCell('% Ritardo', 'string'),
    new excelCreator.ExcelCell('N. Reclami', 'string'),
    new excelCreator.ExcelCell('PPM Scarti', 'string')
  ];

  const wb = excelCreator.create('Performance Clienti', header, excelData, COLUMN_WIDTH);
  return wb;
};

function buildExcelData(clienti) {
  return clienti.map((cliente) => [
    new excelCreator.ExcelCell(cliente.cod_anagrafica, 'string'),
    new excelCreator.ExcelCell(cliente.rag_sociale, 'string'),
    new excelCreator.ExcelCell(cliente.fatturato, 'eur'),
    new excelCreator.ExcelCell(cliente.fatturato_prec, 'eur'),
    new excelCreator.ExcelCell(cliente.variazione_perc, 'percentage'), // Arriva già in percentuale dal db
    new excelCreator.ExcelCell(cliente.lt_medio, 'number'),
    new excelCreator.ExcelCell(cliente.ritardo_perc, 'number'),
    new excelCreator.ExcelCell(cliente.reclami, 'number'),
    new excelCreator.ExcelCell(cliente.ppm_scarti, 'number')
  ]);
}
