/* eslint-disable max-len */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const PuntualitaFornitoriTSService = require('./PuntualitaFornitoriTSService');
const MateriePrimeTSService = require('../MateriePrimeTSService');
const FornitoriTSService = require('../FornitoriTSService');

const FornitoreTS = require('../../models/bi/FornitoreTS');

const excelCreator = require('../../lib/excel-creator');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COLUMN_WIDTH = 20;
const NC_ACQUISTI = 16;

module.exports.getReport = async () => {
  const fornitori = await FornitoreTS.findAll();

  // Il calcolo sull'anno in corso si rapporta allo stesso periodo dell'anno precedente
  const currYear = new Date().getFullYear();
  const currMonth = new Date().getMonth() + 1;
  // Il calcolo sugli anni precedenti si fa sull'intero anno
  const precYear = new Date().getFullYear() - 1;
  const precMonth = 12;

  const promises = [
    findOrdiniFornitori(fornitori, currYear, currMonth),
    findOrdiniFornitori(fornitori, precYear, precMonth)
  ];
  const [ordiniCurrentY, ordiniPrevY] = await Promise.all(promises);

  // Classi di rischio per fornitori e materie prime
  const rischi = ['A', 'B'];
  const fornitoriByRischio = await FornitoriTSService.getFornitoriByRischio(rischi);
  const materiePrimeByRischio = await MateriePrimeTSService.getMateriePrimeByRischio(rischi);
  // Converto in mappa
  const materiePrime = new Map(materiePrimeByRischio.map((mp) => [mp.CodArticolo, mp.DesArticolo]));

  const excelDataCurrent = await getExcelData(ordiniCurrentY, fornitoriByRischio, materiePrime, currMonth);
  const excelDataPrev = await getExcelData(ordiniPrevY, fornitoriByRischio, materiePrime, precMonth);
  const excelData = excelDataCurrent.concat(excelDataPrev);

  const header = [
    new excelCreator.ExcelCell('Anno', 'string'),
    new excelCreator.ExcelCell('Id Fornitore', 'string'),
    new excelCreator.ExcelCell('Nome Fornitore', 'string'),
    new excelCreator.ExcelCell('Classe Fornitore', 'string'),
    new excelCreator.ExcelCell('Num. Ordini', 'string'),
    new excelCreator.ExcelCell('% NC Annui', 'string'),
    new excelCreator.ExcelCell('% Puntualità', 'string'),
    new excelCreator.ExcelCell('% Aumento Ponderato', 'string'),
    new excelCreator.ExcelCell('Costo Totale', 'string')
  ];

  const wb = excelCreator.create('Performance Fornitori', header, excelData, COLUMN_WIDTH);
  return wb;
};

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

async function getExcelData(ordiniTotali, fornitoriByRischio, materiePrime, month) {
  const promises = ordiniTotali.map((ordiniPerFornitore) =>
    buildExcelData(ordiniPerFornitore, fornitoriByRischio, materiePrime, month)
  );
  const excelData = await Promise.all(promises);
  const output = excelData.filter((data) => data.length > 0);
  return output;
}

async function buildExcelData(ordiniPerFornitore, fornitoriByRischio, materiePrime, month) {
  const filteredOrders = ordiniPerFornitore.filter((el) =>
    fornitoriByRischio.some((f) => f.CodFornitore === el.IdFornitore)
  );

  if (filteredOrders.length === 0) {
    return [];
  }
  const ordiniAnnui = new Set(filteredOrders.map((ordine) => ordine.NumeroOrdine));

  // sono sicuro ci siano ordini e sono dello stesso fornitore
  const idFornitore = filteredOrders[0].CodiceFornitore;
  const nomeFornitore = filteredOrders[0].RagioneSociale;
  const classeFornitore = fornitoriByRischio.filter((el) => el.CodFornitore === idFornitore)[0].GruStat2;
  log.info(
    `buildExcelData for idFornitore=${idFornitore}, nomeFornitore=${nomeFornitore}, classeFornitore=${classeFornitore}`
  );
  // recupero l'anno dal primo ordine
  const anno = moment(filteredOrders[0].DataOrdine).year();

  const [nc, puntualita, aumentoPonderato] = await Promise.all([
    calculateNc(ordiniAnnui.size, idFornitore, anno),
    calculatePuntualita(idFornitore, anno),
    calculateAumentoPonderato(filteredOrders, materiePrime, anno, month)
  ]);

  const totalOrdered = filteredOrders.reduce((acc, ordine) => acc + ordine.PrezzoProdotto * ordine.QuantitaOrdinata, 0);

  const fornitore = [
    new excelCreator.ExcelCell(anno, 'number'),
    new excelCreator.ExcelCell(idFornitore, 'number'),
    new excelCreator.ExcelCell(nomeFornitore, 'string'),
    new excelCreator.ExcelCell(classeFornitore, 'string'),
    new excelCreator.ExcelCell(ordiniAnnui.size, 'number'),
    new excelCreator.ExcelCell(nc, 'percentage'),
    new excelCreator.ExcelCell(puntualita, 'percentage'),
    new excelCreator.ExcelCell(aumentoPonderato, 'percentage'),
    new excelCreator.ExcelCell(totalOrdered, 'eur')
  ];
  return fornitore;
}

async function calculateNc(totOrdiniAnnuiFornitore, fornitore, anno) {
  let condition = '';
  if (fornitore !== '-Tutti-') {
    condition = `AND tmo.IdFornitore = ${fornitore}`;
  }
  const sql = `
  SELECT DISTINCT
    cn.Carica,
    tmo.NumeroOrdine,
    tmo.IdFornitore,
    tf.RagioneSociale
  FROM
    commesse_nc cn,
    teamsystem_ordini tmo,
    teamsystem_fornitori tf 
  WHERE cn.TipoNC = ${NC_ACQUISTI}
    AND YEAR(cn.DataNC) = :anno
    AND cn.Carica  IS NOT NULL
    AND cn.Carica = tmo.NumeroOrdine 
    AND tmo.IdFornitore = tf.CodiceFornitore 
    ${condition}`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  if (kpi.length === 0) {
    return 0;
  }

  const percNc = kpi.length / totOrdiniAnnuiFornitore;
  return percNc;
}

async function calculatePuntualita(fornitore, anno) {
  const dal = `${anno}-01-01`;
  const al = `${anno}-12-31`;
  const { puntualita } = await PuntualitaFornitoriTSService.getPuntualita(dal, al, fornitore);

  return parseFloat(puntualita);
}

async function calculateAumentoPonderato(ordiniPerFornitore, materiePrime, anno, month) {
  log.info(`Calcolo l'aumento ponderato per l'anno ${anno} e codice fornitore ${ordiniPerFornitore[0].IdFornitore}`);
  let aumentoPonderato = 0;

  // Per calcolare l'aumento ponderato ho bisogno anche degli ordini dell'anno precedente, relativi allo stesso periodo
  const fornitore = { CodiceFornitore: ordiniPerFornitore[0].IdFornitore };
  const ordPrec = await findOrdiniFornitori([fornitore], anno - 1, month);

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

  const percIncreaseMap = new Map();
  spesaMateriePrimeCurr.forEach((value, key) => {
    if (spesaMateriePrimePrec.has(key)) {
      const spesaCurr = spesaMateriePrimeCurr.get(key);
      const costoMedioCurr = spesaCurr.costototale / spesaCurr.qtaTotale;
      log.info(
        `#1 Costo medio per il fornitore ${
          fornitore.CodiceFornitore
        } per l'anno ${anno} per la materia prima ${key.trim()} pari a ${costoMedioCurr}`
      );
      const spesaPrec = spesaMateriePrimePrec.get(key);
      const costoMedioPrec = spesaPrec.costototale / spesaPrec.qtaTotale;
      log.info(
        `#2 Costo medio per il fornitore ${fornitore.CodiceFornitore} per l'anno ${
          anno - 1
        } per la materia prima ${key.trim()} pari a ${costoMedioPrec}`
      );
      const percentageIncrease = ((costoMedioCurr - costoMedioPrec) / costoMedioPrec) * 100;

      log.info(
        `#3 Percentuale di incremento per la materia prima ${key.trim()} pari a ${percentageIncrease} con spesa totale ${
          spesaCurr.totale
        }`
      );
      percIncreaseMap.set(key, { spesaCurr: spesaCurr.totale, percentageIncrease });
    }
  });

  // Calcolo la spesa totale della materia prima
  let spesaTotaleMp = 0;
  percIncreaseMap.forEach((value) => {
    spesaTotaleMp += value.spesaCurr;
  });

  // Per calcolare la variazione la formula è
  // ad es. variazione = SUM[(spesaInPerc) * (percentualeIncrementoMp / 100)]
  percIncreaseMap.forEach((value, key) => {
    // Calcolo la spesa percentuale sul totale della spesa della materia prima
    const spesaInPerc = (value.spesaCurr / spesaTotaleMp) * 100;
    aumentoPonderato += (spesaInPerc * (value.percentageIncrease / 100)) / 100; // diviso 100 per formato excel
    log.info(
      `#4 Aumento per la materia prima ${key.trim()} pari a ${
        aumentoPonderato * 100
      } dato dalla formula ${spesaInPerc} * ${value.percentageIncrease} / 100`
    );
  });

  return parseFloat(aumentoPonderato.toFixed(2));
}
