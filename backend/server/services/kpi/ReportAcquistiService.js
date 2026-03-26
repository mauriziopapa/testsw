/* eslint-disable max-len */
const Value = require('../../models/response/Value');

module.exports.getReport = async () => {
  const urlFornitori = `${process.env.SERVER_URL}/api/kpi/report_performance_fornitori`;
  const valueFornitori = new Value.Builder().setLabel('Performance Fornitori').setData(urlFornitori).build();

  const urlMateriePrime = `${process.env.SERVER_URL}/api/kpi/report_costi_materie_prime`;
  const valueMateriePrime = new Value.Builder().setLabel('Costi Materie Prime').setData(urlMateriePrime).build();

  const urlMateriePrimeMensili = `${process.env.SERVER_URL}/api/kpi/report_costi_materie_prime_mensile?idwidget_instance=405`;
  const valueMateriePrimeMensili = new Value.Builder()
    .setLabel('Costi Materie Prime Mensili')
    .setData(urlMateriePrimeMensili)
    .build();
  return [valueFornitori, valueMateriePrime, valueMateriePrimeMensili];
};
