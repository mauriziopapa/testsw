/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  let promises = [];
  promises.push(getAnni(dal, al));
  const [tempo] = await Promise.all(promises);

  promises = tempo.map((anni) => buildYearData(anni.anno));
  const results = await Promise.all(promises);
  return results;
};

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

async function buildYearData(anno) {
  const results = await buildConcorrenteData(anno);
  return new ValueGroup.Builder().setLabel(anno).setValori(results).build();
}

async function buildConcorrenteData(anno) {
  const kpi = await getKpi(anno);
  return new Value.Builder().setLabel('').setData(kpi).build();
}

async function getKpi(anno) {
  const sql = `
    SELECT fatturato, 
          concorrenti_anag.nome_azienda as nome_azienda
    FROM concorrenti
          LEFT JOIN concorrenti_anag ON concorrenti.fk_azienda = concorrenti_anag.id
    WHERE anno = :anno 
    ORDER BY concorrenti_anag.id`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return kpi.map((k) => new Value.Builder().setLabel(k.nome_azienda).setData(k.fatturato).build());
}
