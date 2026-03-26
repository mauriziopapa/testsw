/* eslint-disable no-case-declarations */
const KeyValueTable = require('../models/response/KeyValueTable');

const TempoDiIncassoService = require('./kpi/TempoDiIncassoService');
const KPIVariazionePrezziService = require('./KPIVariazionePrezziService');

// Costruita ad hoc sulla tabella
module.exports.saveData = async (tableData) => {
  const promises = tableData.map((data) => {
    switch (data.key) {
      case 'Tempo di incasso':
        return TempoDiIncassoService.setKpi(data.anno, data.value);
      case 'Percentuale Aumento':
        const variazione = {
          anno: data.anno,
          variazione: data.value
        };
        return KPIVariazionePrezziService.update(variazione);

      default:
        return Promise.resolve();
    }
  });
  const results = await Promise.all(promises);

  return results;
};

module.exports.getData = async (anno) => {
  const tempoIncassoKpi = await TempoDiIncassoService.getKpi(anno);
  const tempoIncasso = new KeyValueTable.Builder()
    .setAnno(anno)
    .setKey('Tempo di incasso')
    .setValue(tempoIncassoKpi)
    .build();

  const percAumentoKpi = await KPIVariazionePrezziService.findOneByAnno(anno);
  const percAumento = new KeyValueTable.Builder()
    .setAnno(anno)
    .setKey('Percentuale Aumento')
    .setValue(percAumentoKpi[0].variazione)
    .build();

  return [tempoIncasso, percAumento];
};
