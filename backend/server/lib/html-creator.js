const Handlebars = require('handlebars');

/**
 * create function is used to create pdf from handlebar templates.
 * @param  {document, options}
 * @return {callback}
 */
const create = function create(document) {
  return new Promise((resolve, reject) => {
    if (!document || !document.html || !document.data) {
      reject(new Error('Some, or all, options are missing.'));
    }

    // use helpers
    if (document.helper) {
      document.helper.forEach((element) => {
        Handlebars.registerHelper(element.name, element.function);
      });
    }

    Handlebars.registerHelper('sum', sum);
    Handlebars.registerHelper('formatDate', formatDate);
    Handlebars.registerHelper('iff', ifGreatLessEquals);
    Handlebars.registerHelper('numberFormat', numberFormat);
    Handlebars.registerHelper('upperCase', upperCase);

    // Compiles a template
    const html = Handlebars.compile(document.html)(document.data);
    resolve(html);
  });
};

const sum = (arg1, arg2) => arg1 + arg2;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const newdate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  return new Handlebars.SafeString(newdate);
};

const ifGreatLessEquals = (arg1, operator, arg2, opts) => {
  let bool = false;
  switch (operator) {
    case '===':
      bool = arg1 === arg2;
      break;
    case '>':
      bool = arg1 > arg2;
      break;
    case '<':
      bool = arg1 < arg2;
      break;
    default:
      throw new Error(`Unknown operator ${operator}`);
  }

  if (bool) {
    this.arg1 = arg1;
    return opts.fn(this);
  }
  return opts.inverse(this);
};

/**
 * An Handlebars helper to format numbers
 *
 * This helper have these three optional parameters:
 *  @const decimalLength int The length of the decimals
 *  @const thousandsSep char The thousands separator
 *  @const decimalSep char The decimals separator
 *
 * Based on:
 *  - mu is too short: http://stackoverflow.com/a/14493552/369867
 *  - VisioN: http://stackoverflow.com/a/14428340/369867
 *
 * Demo: http://jsfiddle.net/DennyLoko/6sR87/
 */
const numberFormat = (value, opts) => {
  // Helper parameters
  const dl = opts.hash.decimalLength || 2;
  const ts = opts.hash.thousandsSep || ',';
  const ds = opts.hash.decimalSep || '.';

  // Parse to float
  const floatValue = parseFloat(value);

  // The regex
  const re = `\\d(?=(\\d{3})+${dl > 0 ? '\\D' : '$'})`;

  // Formats the number with the decimals
  // eslint-disable-next-line no-bitwise
  const num = floatValue.toFixed(Math.max(0, ~~dl));

  // Returns the formatted number
  return (ds ? num.replace('.', ds) : num).replace(new RegExp(re, 'g'), `$&${ts}`);
};

const upperCase = (str) => {
  if (str) {
    return str.toUpperCase();
  }
  return '';
};

module.exports.create = create;
