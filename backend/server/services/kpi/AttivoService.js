/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const { kpi_id } = filters;

  const promises = [];
  promises.push(getAnni(dal, al));
  const [tempo] = await Promise.all(promises);

  const resultDati = tempo.map((t) => buildDataAnno(t, kpi_id));
  const datiKpi = await Promise.all(resultDati);
  return datiKpi;
};

async function buildDataAnno(tempo, kpi_id) {
  const promises = [];
  promises.push(buildData(tempo.anno));
  promises.push(TargetService.getTarget(tempo.anno, kpi_id));
  const [valori, target] = await Promise.all(promises);
  return new ValueGroup.Builder().setLabel(tempo.anno).setValori(valori).setTarget(target).build();
}

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM kpi_direzione
  WHERE anno >= :dal AND anno <= :al
  ORDER BY anno ASC`;

  const anni = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });
  return anni;
}

async function buildData(anno) {
  const kpiData = await getKpi(anno);
  const valori = kpiData.map((data) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    new Value.Builder().setLabel(data.nome_azienda).setData(data.totale_passivita).build()
  );

  return valori;
}

async function getKpi(anno) {
  const query_kpi = `
  SELECT
    concorrenti.totale_passivita  as totale_passivita,
    concorrenti_anag.nome_azienda
  FROM
    concorrenti
  LEFT JOIN concorrenti_anag ON
    concorrenti.fk_azienda = concorrenti_anag.id
  WHERE
    anno = :anno
  ORDER BY
    concorrenti_anag.id`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi;
}
