const Value = require('../../models/response/Value');

module.exports.getReport = async () => {
  const urlClientiCommessa = `${process.env.SERVER_URL}/api/kpi/report_pzh_clienti/commessa`;
  const urlClientiProduct = `${process.env.SERVER_URL}/api/kpi/report_pzh_clienti/product`;
  const valueClientiCommessa = new Value.Builder()
    .setLabel('Report pz/h Clienti per Commesse')
    .setData(urlClientiCommessa)
    .build();
  const valueClientiProduct = new Value.Builder()
    .setLabel('Report pz/h Clienti per Prodotti')
    .setData(urlClientiProduct)
    .build();
  return [valueClientiCommessa, valueClientiProduct];
};
