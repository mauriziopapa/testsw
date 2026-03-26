/* eslint-disable no-plusplus */
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
  const { target, kpi_id } = filters;

  const promises = [];
  promises.push(getAnni(dal, al));
  promises.push(TargetService.getTarget(target, kpi_id));
  const [tempo, targetLevel] = await Promise.all(promises);

  const resultDatiReparti = tempo.map((t) => buildDataAnno(t, targetLevel));
  const datiCaricaReparto = await Promise.all(resultDatiReparti);

  return datiCaricaReparto;
};

async function buildDataAnno(tempo, targetLevel) {
  const valori = await buildData(tempo.anno);
  return new ValueGroup.Builder().setLabel(tempo.anno).setValori(valori).setTarget(targetLevel).build();
}

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM concorrenti
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
    new Value.Builder().setLabel(data.nome_azienda).setData(data.fatturato).build()
  );

  return valori;
}

async function getKpi(anno) {
  const query_kpi = `
  SELECT IF(rod>1 OR rod<-1, 0, rod*100) AS fatturato, concorrenti_anag.nome_azienda
  FROM concorrenti
  LEFT JOIN concorrenti_anag ON concorrenti.fk_azienda = concorrenti_anag.id
  WHERE anno = :anno
  ORDER BY concorrenti_anag.id`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi;
}
