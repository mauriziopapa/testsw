const excel = require('excel4node');

const headerFont = {
  font: {
    bold: true,
    color: 'FFFFFF'
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '008000' // green
  }
};
const cellFont = {
  font: {
    bold: false,
    color: '000000'
  }
};
const percentFormat = {
  numberFormat: '#.00 %; -#.00 %; -'
};
const eurFormat = {
  numberFormat: '#,###,###,###.00 €; -#,###,###,###.00 €; -'
};

const create = (sheetName, headerRow, excelData, colWidth) => {
  // Create a new instance of a Workbook class
  const workbook = new excel.Workbook();
  // Add Worksheets to the workbook
  const worksheet = workbook.addWorksheet(sheetName);
  const headerStyle = workbook.createStyle(headerFont);
  const cellStyle = workbook.createStyle(cellFont);
  const percentStyle = workbook.createStyle(percentFormat);
  const eurStyle = workbook.createStyle(eurFormat);

  // Imposto l'header del file excel
  headerRow.forEach((head, index) => {
    createCell(worksheet, head, 1, index, headerStyle, null);
    worksheet.column(index + 1).setWidth(colWidth);
  });
  // Imposto filtri sull'header
  worksheet.row(1).filter();

  // Imposto i dati del file excel
  excelData.forEach((dataRow, row) => {
    dataRow.forEach((data, column) => {
      // skip header with row +2
      createCell(worksheet, data, row + 2, column, cellStyle, percentStyle, eurStyle);
    });
  });

  return workbook;
};

const createCell = (worksheet, cell, row, column, cellStyle, percentStyle, eurStyle) => {
  switch (cell.type) {
    case 'string':
      createStringCell(worksheet, cell, row, column, cellStyle);
      break;
    case 'number':
      createNumberCell(worksheet, cell, row, column, cellStyle);
      break;
    case 'percentage':
      createNumberCell(worksheet, cell, row, column, percentStyle);
      break;
    case 'eur':
      createNumberCell(worksheet, cell, row, column, eurStyle);
      break;
    default:
      break;
  }
};

const createStringCell = (worksheet, cell, row, column, style) => {
  worksheet
    .cell(row, column + 1)
    .string(cell.value)
    .style(style);
};

const createNumberCell = (worksheet, cell, row, column, style) => {
  worksheet
    .cell(row, column + 1)
    .number(cell.value)
    .style(style);
};

class ExcelCell {
  value = '';
  type = '';

  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
}

module.exports.create = create;
module.exports.ExcelCell = ExcelCell;
