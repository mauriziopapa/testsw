const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');
const FornitoreTS = require('../models/bi/FornitoreTS');

const queryCostoMp = `
    SELECT
        tf.CodiceFornitore as CodiceFornitore,
        tf.RagioneSociale as RagioneSociale,
        SUM(tom.PrezzoProdotto * tom.QuantitaOrdinata) as costo
    FROM
        teamsystem_fornitori tf,
        teamsystem_ordini_materieprime tom 
    WHERE
        tf.CodiceFornitore = tom.IdFornitore
        AND YEAR(tom.DataOrdine) = :anno
    GROUP BY
        CodiceFornitore`;

const queryCosto = `
    SELECT
        tf.CodiceFornitore as CodiceFornitore,
        tf.RagioneSociale as RagioneSociale,
        SUM(to2.PrezzoProdotto * to2.QuantitaOrdinata) as costo
    FROM
        teamsystem_fornitori tf,
        teamsystem_ordini to2
    WHERE
        tf.CodiceFornitore = to2.IdFornitore
        AND YEAR(to2.DataOrdine) = :anno
    GROUP BY
        CodiceFornitore
    UNION
    ${queryCostoMp}`;

module.exports.findAll = async () => FornitoreTS.findAll({ order: ['RagioneSociale'] });

module.exports.getAllFornitoriByCosto = async () => {
  const anno = new Date().getFullYear();
  const sql = `
    ${queryCosto}
    ORDER BY costo DESC`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return fornitori;
};

module.exports.getFornitoriMPByCosto = async () => {
  const anno = new Date().getFullYear();
  const sql = `
    ${queryCostoMp}
      ORDER BY costo DESC`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return fornitori;
};

module.exports.getFornitoriByRischioAndCosto = async (rischio) => {
  const anno = new Date().getFullYear();
  const sql = `
  SELECT
      w.CodiceFornitore,
      w.RagioneSociale,
      SUM(w.costo) as costo
    FROM
     (
      SELECT
          DISTINCT 
          q.CodiceFornitore,
          q.RagioneSociale,
          q.costo
    FROM
        teamsystem_articoli ta,
        ( ${queryCosto} ) as q
    WHERE
        ta.GruStat2 = :rischio
        and q.CodiceFornitore = ta.CodFornitore
    ) as w
    group by
        w.CodiceFornitore
    order by
        costo desc`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { rischio, anno },
    type: QueryTypes.SELECT
  });

  return fornitori;
};

module.exports.getFornitoriByRischio = async (risks) => {
  const sql = `
    SELECT DISTINCT 
      ta.CodFornitore,
      ta.GruStat2 
    FROM
      teamsystem_articoli ta
    WHERE
      ta.GruStat2 IN (:risks)`;

  const fornitori = await dbBi.sequelizeBi.query(sql, {
    replacements: { risks },
    type: QueryTypes.SELECT
  });

  return fornitori;
};
