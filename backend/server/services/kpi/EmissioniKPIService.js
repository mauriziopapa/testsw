/* eslint-disable camelcase */
const moment = require('moment');
const { QueryTypes } = require('sequelize');

const PuntiDiEmissioneService = require('../PuntiDiEmissioneService');

const { dbBi } = require('../../lib/db');
const { FORMAT_DATE } = require('../../lib/time');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { from, to, pde } = filters;
  const dal = moment(from);
  const al = moment(to);
  const dataPromises = await buildData(dal, al, pde);
  const results = await Promise.all(dataPromises);

  return results;
};

async function buildData(dal, al, pde) {
  let punto_emissione = '';
  if (pde !== '-Tutti-') {
    punto_emissione = 'AND e.id_punto_di_emissione = :pde';
  }
  /* vecchia query con la somma, non necessaria dopo ticket #1378
  const sql = `
  SELECT
    e.punto_di_emissione as pde,
    e.inquinante as inquinante,
    SUM(e.c_rilevata) as rilevata,
    e.limiti_di_legge as limite,
    e.limite_al_100,
    e.limite_al_70,
    e.limite_al_50,
    e.limite_al_20
  FROM
    emissioni e
  WHERE
    e.\`data\` BETWEEN :dal AND :al
    ${punto_emissione}
  GROUP BY pde,
    inquinante,
    limite,
    e.limite_al_100,
    e.limite_al_70,
    e.limite_al_50,
    e.limite_al_20
    `; */
  const sql = `
  SELECT
    e.punto_di_emissione as pde,
    e.inquinante as inquinante,
    e.c_rilevata as rilevata,
    e.limiti_di_legge as limite,
    e.limite_al_100,
    e.limite_al_70,
    e.limite_al_50,
    e.limite_al_20
  FROM
    emissioni e
  WHERE
    e.\`data\` BETWEEN :dal AND :al
    ${punto_emissione}
  `;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal: dal.format(FORMAT_DATE), al: al.format(FORMAT_DATE), pde },
    type: QueryTypes.SELECT
  });

  const result = kpi.map((k) => {
    let perc = 0;
    if (k.limite > 0) {
      perc = ((k.rilevata / k.limite) * 100).toFixed(2);
    }
    return {
      etichetta_estesa: `${k.pde}/${k.inquinante}`,
      valore_percentuale: perc,
      limite_al_20: k.limite_al_20,
      limite_al_50: k.limite_al_50,
      limite_al_70: k.limite_al_70,
      limite_al_100: k.limite_al_100
    };
  });

  if (result.length === 0) {
    if (pde === '-Tutti-') {
      const punti = await PuntiDiEmissioneService.findAll();
      punti.forEach((punto) => {
        result.push({
          etichetta_estesa: `${punto.nome}`,
          valore_percentuale: 0,
          limite_al_20: 20,
          limite_al_50: 50,
          limite_al_70: 70,
          limite_al_100: 100
        });
      });
    } else {
      const punto = await PuntiDiEmissioneService.findOneById(pde);
      result.push({
        etichetta_estesa: `${punto.nome}`,
        valore_percentuale: 0,
        limite_al_20: 20,
        limite_al_50: 50,
        limite_al_70: 70,
        limite_al_100: 100
      });
    }
  }

  return result;
}
