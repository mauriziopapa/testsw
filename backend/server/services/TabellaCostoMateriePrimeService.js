/* eslint-disable implicit-arrow-linebreak */
const OrdineMateriaPrimaAnnualeTS = require('../models/bi/OrdineMateriaPrimaAnnualeTS');

module.exports.saveData = async (costi) => {
  const promises = costi.map((costo) =>
    OrdineMateriaPrimaAnnualeTS.update(
      {
        quantita: costo.quantita_totale,
        costo_totale: costo.costo_totale,
        costo_unitario: costo.costo_totale / costo.quantita_totale || 0
      },
      { where: { id: costo.id } }
    )
  );
  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (anno) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  OrdineMateriaPrimaAnnualeTS.findAll({
    where: { anno, famiglia_mp: 'PCR' }
  });
