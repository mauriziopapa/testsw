/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const config = require('../config').job;

const { dbBi } = require('../lib/db');

const log = config.log();

const populate = async () => {
  for (let anno = 2022; anno <= 2039; anno += 1) {
    for (let mese = 1; mese <= 12; mese += 1) {
      for (let impianto = 18; impianto <= 21; impianto += 1) {
        await insert(anno, mese, impianto, 5);
        await insert(anno, mese, impianto, 6);
        await insert(anno, mese, impianto, 7);
        await insert(anno, mese, impianto, 20);
        await insert(anno, mese, impianto, 21);
        await insert(anno, mese, impianto, 22);
        await insert(anno, mese, impianto, 23);
        await insert(anno, mese, impianto, 25);
        await insert(anno, mese, impianto, 26);
        await insert(anno, mese, impianto, 31);
        await insert(anno, mese, impianto, 44);
        await insert(anno, mese, impianto, 45);
      }
    }
  }
};

const insert = async (anno, mese, impianto, kpi) => {
  const sql = `
  INSERT INTO impianti_crud
  (anno, mese, fk_impianto, fk_kpi, valore, forzatura_manuale)
  VALUES(:anno, :mese, :impianto, :kpi, 0, 0);
  ;
    `;

  const kpis = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, impianto, kpi },
    type: QueryTypes.INSERT
  });

  return kpis;
};

populate();
