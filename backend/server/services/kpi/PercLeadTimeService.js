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
  const target = await TargetService.getTarget(inputTarget, 123);
  let target_lt = 0;
  if (target) {
    target_lt = target;
  }

  const kpi = await buildData(dal, al, cliente, target_lt);

  let commesse = 0;
  let in_ritardo = 0;
  let lt_ponderato = 0;
  let ritardo_perc_medio = 0;
  const result_tmp = [];
  kpi.forEach((val) => {
    // aggiorno il totale commesse
    commesse += val.ncommesse;
    in_ritardo += val.in_ritardo;
    // aggiorno il calcolo pomnderato che alla fine sottrarrò per $commesse
    lt_ponderato += val.lt * val.ncommesse;

    result_tmp.push({
      label: val.macroarea,
      target: target_lt,
      lt: val.lt,
      ncommesse: val.ncommesse,
      in_ritardo: val.in_ritardo,
      m: `m_${val.mid}`,
      perc_in_ritardo: ((val.in_ritardo / val.ncommesse) * 100).toFixed(2)
    });
  });

  lt_ponderato /= commesse;
  ritardo_perc_medio = ((in_ritardo / commesse) * 100).toFixed(2);

  const results = {
    data: result_tmp,
    lt_ponderato,
    ritardo_perc_medio,
    commesse
  };
  return results;
};

async function buildData(dal, al, cliente, target_lt) {
  const const_mesi = `date(concat(LAST_DAY(c.\`Data Bolla\`))) >= date('${dal}') AND c.\`Data Bolla\` <= date('${al}')`;

  const sql = `
  SELECT c.macroarea AS gruppo,
    AVG(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`)) AS lt,
    COUNT(*) AS ncommesse, 
    SUM(IF(DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) > ${target_lt} AND DATEDIFF(c.DataChiusura, c.\`DataRicMat\`) < 31, 1, 0)) AS in_ritardo,
    m.macroarea,
    m.id AS mid  
  FROM commesse AS c
  INNER JOIN macroaree AS m ON m.id = c.macroarea
  WHERE ${const_mesi}
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
