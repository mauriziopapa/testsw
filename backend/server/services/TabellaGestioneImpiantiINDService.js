/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const { buildMonthInterval, getMonthFromNumber } = require('../lib/time');
const ImpiantiCrud = require('../models/bi/ImpiantiCrud');
const BIConstants = require('../models/bi/BIConstants');
const ImpiantiInduzioneService = require('./ImpiantiInduzioneService');

const { dbBi } = require('../lib/db');

const { Op } = dbBi.Sequelize;

module.exports.saveDataDipendentiCount = async (impianti) => {
  const impiantiCrud = impianti.flatMap((imp) => imp.valori);

  const promises = impiantiCrud.map((impianto) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    ImpiantiCrud.update(
      { valore: impianto.valore, forzatura_manuale: impianto.forzatura_manuale },
      { where: { id: impianto.id } }
    )
  );

  const results = await Promise.all(promises);
  return results;
};

module.exports.saveData = async (impianti) => {
  const impiantiCrud = impianti.flatMap((imp) => imp.valori);

  const promises = impiantiCrud.map((impianto) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    ImpiantiCrud.update(
      { valore: impianto.valore, forzatura_manuale: impianto.forzatura_manuale },
      { where: { id: impianto.id } }
    )
  );

  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year, month, user) => {
  const impianti = await getGruppiDiLavoro();
  const valori = await getValori(year, month);
  const mesi = buildIntestazioneMesi(year, month);
  const kpis = await getKpi();
  const dipendenti = await ImpiantiInduzioneService.getDipendentiCount(year, month, user);

  // raggruppo i valori per kpi
  const idsImpianti = impianti.map((i) => i.id);
  const kpiRows = [];
  for (let i = 0; i < kpis.length; i += 1) {
    const row = kpis[i];

    row.valori = valori.filter((v) => v.fk_kpi === row.id);

    if (row.valori.length === 0 && row.calcolato) {
      const kpiProd = await getKpiProduzione(year, month, row.id);
      row.valori = kpiProd;
    }

    row.valori.sort((a, b) => idsImpianti.indexOf(a.fk_impianto) - idsImpianti.indexOf(b.fk_impianto));
    kpiRows.push(row);
  }
  return { mesi, impianti, kpi_rows: kpiRows, dipendenti };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='impianti_ind' ORDER BY ordine";

  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getGruppiDiLavoro() {
  const query = `SELECT *,
      (
        SELECT COUNT(*) 
        FROM impianti_anag AS sub 
        WHERE sub.gruppo_impianto = impianti_anag.gruppo_impianto
      ) AS nr_impianti 
    FROM impianti_anag 
    WHERE gruppo_impianto = "${BIConstants.IND.label}"
    ORDER BY ordine, nome_impianto`;

  const impianti = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });

  const gruppiImpianti = new Map();

  // Per raggruppare gli impianti in gruppi di lavoro
  impianti.forEach((impianto) => {
    if (!gruppiImpianti.has(impianto.gruppo_impianto)) {
      gruppiImpianti.set(impianto.gruppo_impianto, []);
    }
    const arrayImpianti = gruppiImpianti.get(impianto.gruppo_impianto);
    arrayImpianti.push(impianto);
  });

  // Ora posso aggiungere le colonne SOMMA ai gruppi di lavoro con più di un centro di lavoro
  const impiantiConSomme = [];
  gruppiImpianti.forEach((values, key) => {
    values.forEach((v, index) => {
      impiantiConSomme.push(v);
      if (values.length > 1 && index === values.length - 1) {
        impiantiConSomme.push({
          nome_impianto: `${key} SOMMA`,
          gruppo_impianto: key,
          ordine: v.ordine,
          classe: 'somma'
        });
      }
    });
  });

  return impiantiConSomme;
}

async function getValori(anno, mese) {
  const impiantoCondition = { fk_impianto: { [Op.in]: BIConstants.IND.id } };
  const condition = {
    [Op.and]: [{ anno: parseInt(anno) }, { mese: parseInt(mese) }, impiantoCondition]
  };

  const valori = await ImpiantiCrud.findAll({
    where: condition,
    order: ['anno', 'mese', 'fk_impianto']
  });

  return valori;
}

async function getKpiProduzione(anno, mese, kpi) {
  const query = `
  SELECT * 
  FROM kpi_produzione kp 
  WHERE anno = :anno AND mese = :mese AND kpi = :kpi AND reparto = :reparto`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno, mese, kpi, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  return result;
}

function buildIntestazioneMesi(anno, mese) {
  if (mese != null && mese !== '-tutti-') {
    return [
      {
        id_mese: mese,
        nome_mese: getMonthFromNumber(parseInt(mese))
      }
    ];
  }

  const months = buildMonthInterval(`${anno}-01-01`, `${anno}-12-31`);
  return months.map((m) => ({ id_mese: m.number, nome_mese: m.label }));
}
