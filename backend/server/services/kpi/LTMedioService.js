/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { cliente } = filters;
  const inputTarget = filters.target;
  const target = await TargetService.getTarget(inputTarget, 121);
  let target_lt = 0;
  if (target) {
    target_lt = target;
  }

  const kpi = await buildData(dal, al, cliente, target_lt);

  let commesse = 0;
  let lt_ponderato = 0;
  const result_tmp = [];
  kpi.forEach((val) => {
    // aggiorno il totale commesse
    commesse += val.ncommesse;
    // aggiorno il calcolo ponderato che alla fine sottrarrò per $commesse
    lt_ponderato += val.lt * val.ncommesse;

    result_tmp.push({
      label: val.macroarea,
      target: target_lt,
      lt: val.lt,
      ncommesse: val.ncommesse,
      m: `m_${val.mid}`
    });
  });

  lt_ponderato /= commesse;

  const results = {
    data: result_tmp,
    lt_ponderato,
    commesse
  };
  return results;
};

async function buildData(dal, al, cliente, target_lt) {
  const const_mesi = `date(concat(LAST_DAY(c.\`Data Bolla\`))) >= date('${dal}') AND c.\`Data Bolla\` <= date('${al}')`;

  const sql = `
  SELECT c.macroarea AS gruppo,
    ROUND(AVG(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`)), 2) AS lt,
    COUNT(*) AS ncommesse, 
    SUM(IF(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) > ${target_lt} AND DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) < 31, 1, 0)) AS in_ritardo,
    m.macroarea,
    m.id AS mid  
  FROM commesse AS c
  INNER JOIN macroaree AS m ON m.id = c.macroarea
  WHERE ${const_mesi} AND DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) < 31
    AND (c.\`Codice Cliente\` = '${cliente}' OR '${cliente}' = '-Tutti-')
    AND (c.\`Flag Evasa\` = 1 OR c.\`Flag Evasa\` = 'Y')
    AND m.macroarea != 'Pozzo'
  GROUP BY m.macroarea
  ORDER BY m.id ASC`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return kpi;
}
