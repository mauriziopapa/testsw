/* eslint-disable operator-linebreak */
/* eslint-disable max-len */
const Value = require('../../models/response/Value');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getReport = async () => {
  const url =
    'http://pentaho.studioware.eu:8080/pentaho/content/reporting/reportviewer/report.html?solution=temprasud&path=%2F&name=resa_carica_media.prpt&locale=it_IT&userid=joe&password=stud10ware&layout=flow#ANNO%253D2022%2526REPARTO%253DLLF%2526output-type%253Dtext%25252Fhtml%2526accepted-page%253D0%2526solution%253Dtemprasud%2526path%253D%25252F%2526name%253Dresa_carica_media.prpt%2526locale%253Dit_IT%2526userid%253Djoe%2526password%253Dstud10ware%2526layout%253Dflow';
  const value = new Value.Builder().setLabel('Resa Carica Media').setData(url).build();

  return [value];
};

module.exports.getReportResaCaricaMedia = async () => {
  const url = `${process.env.FRONTEND_URL}/report-resa-carica-media`;
  const value = new Value.Builder().setLabel('Resa Carica Media').setData(url).build();

  return [value];
};
