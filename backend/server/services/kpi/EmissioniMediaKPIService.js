const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { FORMAT_DATE } = require('../../lib/time');

const PuntiDiEmissioneService = require('../PuntiDiEmissioneService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { from, to, pde } = filters;
  const dal = moment(from);
  const al = moment(to);
  const results = await buildData(dal, al, pde);
  return results;
};

async function buildData(dal, al, pde) {
  let puntoEmissione = '';
  if (pde !== '-Tutti-') {
    puntoEmissione = 'AND e.id_punto_di_emissione = :pde';
  }
  const sql = `
  SELECT
    e.punto_di_emissione as pde,
    ROUND(MAX(e.c_rilevata), 2) as rilevata_max,
    ROUND(MIN(e.c_rilevata), 2) as rilevata_min,
    ROUND(AVG(e.c_rilevata), 2) as rilevata_avg
  FROM
    emissioni e
  WHERE
    e.\`data\` BETWEEN :dal AND :al
    ${puntoEmissione}
  GROUP BY pde
  `;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { dal: dal.format(FORMAT_DATE), al: al.format(FORMAT_DATE), pde },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    const punti = await PuntiDiEmissioneService.findAll();
    return punti.map((punto) => {
      const valori = [
        new Value.Builder().setLabel('MIN').setData(0).build(),
        new Value.Builder().setLabel('MAX').setData(0).build(),
        new Value.Builder().setLabel('AVG').setData(0).build()
      ];

      return new ValueGroup.Builder().setLabel(punto.nome).setValori(valori).build();
    });
  }

  return kpi.map((k) => {
    const valori = [
      new Value.Builder().setLabel('MIN').setData(k.rilevata_min).build(),
      new Value.Builder().setLabel('MAX').setData(k.rilevata_max).build(),
      new Value.Builder().setLabel('AVG').setData(k.rilevata_avg).build()
    ];

    return new ValueGroup.Builder().setLabel(k.pde).setValori(valori).build();
  });
}
