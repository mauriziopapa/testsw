const htmlDocx = require('html-docx-js');

/**
 * create function is used to create pdf from handlebar templates.
 * @param  {document, options}
 * @return {callback}
 */
const create = function create(html, options) {
  return new Promise((resolve, reject) => {
    if (!html) {
      reject(new Error('Some, or all, options are missing.'));
    }

    const converted = htmlDocx.asBlob(html, options);
    resolve(converted);
  });
};

module.exports.create = create;
