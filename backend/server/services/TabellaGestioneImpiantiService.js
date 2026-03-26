/* eslint-disable no-await-in-loop */
const { QueryTypes } = require('sequelize');
const { buildMonthInterval, getMonthFromNumber } = require('../lib/time');
const ImpiantiCrud = require('../models/bi/ImpiantiCrud');
const BIConstants = require('../models/bi/BIConstants');

const { dbBi } = require('../lib/db');

const { Op } = dbBi.Sequelize;

module.exports.saveData = async (impianti) => {
  const impiantiCrud = impianti.flatMap((imp) => imp.valori);

  const promises = impiantiCrud.map((impianto) =>
    // aggiorno solo i valori presenti in tabella,
    // i kpi calcolati in percentuale vanno su kpi_produzione
    // eslint-disable-next-line implicit-arrow-linebreak
    ImpiantiCrud.update(
      { valore: impianto.valore, forzatura_manuale: impianto.forzatura_manuale },
      { where: { id: impianto.id } }
    )
  );

  const results = await Promise.all(promises);
  return results;
};

module.exports.getData = async (year, month) => {
  const impianti = await getGruppiDiLavoro();
  const valori = await getValori(year, month);
  const mesi = buildIntestazioneMesi(year, month);
  const kpis = await getKpi();

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
  return { mesi, impianti, kpi_rows: kpiRows };
};

async function getKpi() {
  const query = "SELECT * FROM kpi WHERE crud='impianti' ORDER BY ordine";

  const kpi = await dbBi.sequelizeBi.query(query, {
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getGruppiDiLavoro() {
  // Tenifer e Pozzo non vengono considerati più
  const query = `SELECT *,
        (
          SELECT COUNT(*) 
          FROM impianti_anag AS sub 
          WHERE sub.gruppo_impianto = impianti_anag.gruppo_impianto
        ) AS nr_impianti 
      FROM impianti_anag 
      WHERE gruppo_impianto NOT IN 
      ('${BIConstants.TENIFER.label}', 
      '${BIConstants.POZZO.label}', 
      '${BIConstants.IND.label}', 
      '${BIConstants.FVF.label}', 
      '${BIConstants.FVFSZ.label}')
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
  const impiantoCondition = {
    fk_impianto: {
      [Op.not]: [BIConstants.TENIFER.id, BIConstants.POZZO.id, BIConstants.FVFSZ.id]
        .concat(BIConstants.IND.id)
        .concat(BIConstants.FVF.id)
    }
  };
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
  WHERE anno = :anno AND mese = :mese AND kpi = :kpi AND reparto != :reparto`;

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

/* query per inserire i dati in tabella
async function populate(impianti, kpis) {
  for (let mese = 1; mese <= 12; mese++) {
    for (let j = 0; j < kpis.length; j++) {
      const k = kpis[j];
      if (k.calcolato) {
        for (let y = 2023; y < 2040; y++) {
          let query = `INSERT INTO temprasud_bi.impianti_crud
          (anno, mese, fk_impianto, fk_kpi, valore) VALUES(${y}, ${mese}, 10, ${k.id}, 0)`;

          let kpi = await dbBi.sequelizeBi.query(query, {
            type: QueryTypes.INSERT
          });
        }
      }
    }
  }

  return '';
}
*/
