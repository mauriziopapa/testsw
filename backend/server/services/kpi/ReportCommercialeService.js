const Value = require('../../models/response/Value');

module.exports.getReport = async () => {
  const urlClienti = `${process.env.SERVER_URL}/api/kpi/report_performance_clienti`;
  const valueClienti = new Value.Builder().setLabel('Report Clienti').setData(urlClienti).build();
  return [valueClienti];
};
