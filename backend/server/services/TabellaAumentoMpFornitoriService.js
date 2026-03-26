/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');
const FornitoriTSService = require('./FornitoriTSService');
const MateriePrimeTSService = require('./MateriePrimeTSService');

const FornitoreTS = require('../models/bi/FornitoreTS');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getData = async () => {
  const fornitori = await FornitoreTS.findAll();

  const year = new Date().getFullYear();
  const yearPrec = new Date().getFullYear() - 1;
  const month = new Date().getMonth() + 1;

  const promises = [year, yearPrec].map((y) => findOrdiniFornitori(fornitori, y, month));
  const [ordiniCurrentY, ordiniPrevY] = await Promise.all(promises);

  // Classi di rischio per fornitori e materie prime
  const rischi = ['A', 'B'];
  const fornitoriByRischio = await FornitoriTSService.getFornitoriByRischio(rischi);
  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);
  // Converto in mappa
  const materiePrime = new Map(materiePrimeByRischio.map((mp) => [mp.CodArticolo, mp.DesArticolo]));

  const tableDataCurrent = await getTableData(ordiniCurrentY, fornitoriByRischio, materiePrime, month);
  const tableDataPrev = await getTableData(ordiniPrevY, fornitoriByRischio, materiePrime, month);
  return tableDataCurrent.concat(tableDataPrev).flatMap((k) => k);
};

async function getTableData(ordiniTotali, fornitoriByRischio, materiePrime, month) {
  const promises = ordiniTotali.map((ordiniPerFornitore) =>
    buildTableData(ordiniPerFornitore, fornitoriByRischio, materiePrime, month)
  );
  const tableData = await Promise.all(promises);
  const output = tableData.filter((data) => data.length > 0);
  return output;
}

async function buildTableData(ordiniPerFornitore, fornitoriByRischio, materiePrime, month) {
  const filteredOrders = ordiniPerFornitore.filter((el) =>
    fornitoriByRischio.some((f) => f.CodFornitore === el.IdFornitore)
  );

  if (filteredOrders.length === 0) {
    return [];
  }

  // recupero l'anno dal primo ordine
  const anno = moment(filteredOrders[0].DataOrdine).year();
  const ordini = await calculateAumentoMp(filteredOrders, materiePrime, anno, month);
  return ordini;
}

async function calculateAumentoMp(ordiniPerFornitore, materiePrime, year, month) {
  const output = [];

  const fornitore = {
    CodiceFornitore: ordiniPerFornitore[0].IdFornitore,
    RagioneSociale: ordiniPerFornitore[0].RagioneSociale
  };
  // Per calcolare l'aumento ponderato ho bisogno anche degli ordini dell'anno precedente
  const ordPrec = await findOrdiniFornitori([fornitore], year - 1, month);

  // Filtro gli elementi degli ordini solo per le materie prime di classe A e B
  const ordiniFiltrati = ordiniPerFornitore.filter((ordine) => materiePrime.has(ordine.CodiceArticolo));
  const ordPrecFiltrati = ordPrec && ordPrec.length > 0 && ordPrec[0].filter((o) => materiePrime.has(o.CodiceArticolo));

  // Calcolo la somma dei prezzi
  const spesaMateriePrimeCurr = new Map();
  const spesaMateriePrimePrec = new Map();
  ordiniFiltrati.forEach((ordine) => {
    let tot = 0;
    let costototale = 0;
    let qtaTotale = 0;
    if (spesaMateriePrimeCurr.has(ordine.CodiceArticolo)) {
      tot = spesaMateriePrimeCurr.get(ordine.CodiceArticolo).totale;
      costototale = spesaMateriePrimeCurr.get(ordine.CodiceArticolo).costototale;
      qtaTotale = spesaMateriePrimeCurr.get(ordine.CodiceArticolo).qtaTotale;
      tot += ordine.PrezzoProdotto * ordine.QuantitaOrdinata;
      costototale += parseFloat(ordine.PrezzoProdotto) * parseFloat(ordine.QuantitaOrdinata);
      qtaTotale += parseFloat(ordine.QuantitaOrdinata);
    } else {
      tot += ordine.PrezzoProdotto * ordine.QuantitaOrdinata;
      costototale += parseFloat(ordine.PrezzoProdotto) * parseFloat(ordine.QuantitaOrdinata);
      qtaTotale += parseFloat(ordine.QuantitaOrdinata);
    }
    spesaMateriePrimeCurr.set(ordine.CodiceArticolo, {
      prezzo: ordine.PrezzoProdotto,
      costototale: parseFloat(costototale),
      qtaTotale: parseFloat(qtaTotale),
      totale: parseFloat(tot)
    });
  });

  if (ordPrecFiltrati) {
    ordPrecFiltrati.forEach((ordine) => {
      let tot = 0;
      let costototale = 0;
      let qtaTotale = 0;
      if (spesaMateriePrimePrec.has(ordine.CodiceArticolo)) {
        tot = spesaMateriePrimePrec.get(ordine.CodiceArticolo).totale;
        costototale = spesaMateriePrimePrec.get(ordine.CodiceArticolo).costototale;
        qtaTotale = spesaMateriePrimePrec.get(ordine.CodiceArticolo).qtaTotale;
        tot += ordine.PrezzoProdotto * ordine.QuantitaOrdinata;
        costototale += parseFloat(ordine.PrezzoProdotto) * parseFloat(ordine.QuantitaOrdinata);
        qtaTotale += parseFloat(ordine.QuantitaOrdinata);
      } else {
        tot += ordine.PrezzoProdotto * ordine.QuantitaOrdinata;
        costototale += parseFloat(ordine.PrezzoProdotto) * parseFloat(ordine.QuantitaOrdinata);
        qtaTotale += parseFloat(ordine.QuantitaOrdinata);
      }
      spesaMateriePrimePrec.set(ordine.CodiceArticolo, {
        prezzo: ordine.PrezzoProdotto,
        costototale: parseFloat(costototale),
        qtaTotale: parseFloat(qtaTotale),
        totale: parseFloat(tot)
      });
    });
  }

  spesaMateriePrimeCurr.forEach((value, key) => {
    if (spesaMateriePrimePrec.has(key)) {
      const spesaCurr = spesaMateriePrimeCurr.get(key);
      const spesaPrec = spesaMateriePrimePrec.get(key);
      const costoMedioCurr = spesaCurr.costototale / spesaCurr.qtaTotale;
      const costoMedioPrec = spesaPrec.costototale / spesaPrec.qtaTotale;
      const percentageIncrease = ((costoMedioCurr - costoMedioPrec) / costoMedioPrec) * 100;

      output.push({
        anno: year,
        mese: month,
        fornitore: fornitore.RagioneSociale,
        materiaPrima: key.trim(),
        spesaCurr: spesaCurr.totale,
        prezzoCurr: costoMedioCurr,
        spesaPrec: spesaPrec.totale,
        prezzoPrec: costoMedioPrec,
        incremento: parseFloat(percentageIncrease.toFixed(2))
      });
    }
  });

  return output;
}

async function findOrdiniFornitori(fornitori, year, month) {
  // get anche materie prime
  const ordiniPromises = fornitori.map((fornitore) => {
    const sql = `
    SELECT
      tmp.id as id,
      tmp.IdFornitore as IdFornitore,
      tmp.DataOrdine as DataOrdine,
      tmp.NumeroOrdine as NumeroOrdine,
      tmp.SezOrdine as SezOrdine,
      tmp.DataEvasione as DataEvasione,
      tmp.DataPrevConsegna as DataPrevConsegna,
      tmp.PrezzoProdotto as PrezzoProdotto,
      tmp.QuantitaOrdinata as QuantitaOrdinata,
      tmp.CodiceArticolo as CodiceArticolo,
      tmp.DescrArticolo as DescrArticolo,
      tmp.QuantitaConsegnata as QuantitaConsegnata,
      tmp.Extracosti as Extracosti,
      tsf.CodiceFornitore as CodiceFornitore,
      tsf.RagioneSociale as RagioneSociale
    FROM
      teamsystem_ordini_materieprime AS tmp,
      teamsystem_fornitori AS tsf
    WHERE
      YEAR(tmp.DataOrdine) = :year AND MONTH(tmp.DataOrdine) <= :month
      AND tmp.DataEvasione IS NOT NULL
      AND tmp.DataPrevConsegna IS NOT NULL
      AND tmp.IdFornitore = tsf.CodiceFornitore 
      AND tmp.IdFornitore = :fornitore
    UNION
    SELECT
      tso.id as id,
      tso.IdFornitore as IdFornitore,
      tso.DataOrdine as DataOrdine,
      tso.NumeroOrdine as NumeroOrdine,
      tso.SezOrdine as SezOrdine,
      tso.DataEvasione as DataEvasione,
      tso.DataPrevConsegna as DataPrevConsegna,
      tso.PrezzoProdotto as PrezzoProdotto,
      tso.QuantitaOrdinata as QuantitaOrdinata,
      tso.CodiceArticolo as CodiceArticolo,
      tso.DescrArticolo as DescrArticolo,
      tso.QuantitaConsegnata as QuantitaConsegnata,
      tso.Extracosti as Extracosti,
      tsf.CodiceFornitore as CodiceFornitore,
      tsf.RagioneSociale as RagioneSociale
    FROM
      teamsystem_ordini AS tso,
      teamsystem_fornitori AS tsf
    WHERE
      YEAR(tso.DataOrdine) = :year AND MONTH(tso.DataOrdine) <= :month
      AND tso.DataEvasione IS NOT NULL
      AND tso.DataPrevConsegna IS NOT NULL
      AND tso.IdFornitore = tsf.CodiceFornitore 
      AND tso.IdFornitore = :fornitore`;

    return dbBi.sequelizeBi.query(sql, {
      replacements: { year, month, fornitore: fornitore.CodiceFornitore },
      type: QueryTypes.SELECT
    });
  });

  const allOrdini = await Promise.all(ordiniPromises);
  const ordiniTotaliPerFornitore = allOrdini
    .filter((ordine) => ordine.length > 0)
    .sort(
      (a, b) =>
        // ASC  -> a.length - b.length
        // DESC -> b.length - a.length
        b.length - a.length
    );

  return ordiniTotaliPerFornitore;
}
