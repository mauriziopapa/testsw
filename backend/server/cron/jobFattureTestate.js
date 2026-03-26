/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');

const config = require('../config').jobFatture;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const FattureTestate = require('../models/bi/FattureTestate');

const log = config.log();

const jobFattureTestate = async (anno) => {
  const startTime = new Date();

  try {
    const fattureQwin = await getFatture(anno);
    const fattureSapere = fattureQwin.map((fQwin) => {
      // no time to make it better converting "2023-02-28T00:00:00+01:00" to keep constistency with db
      let dataFormatted = null;
      let dataMese = null;
      if (fQwin.DataFattura != null) {
        const dataArr = fQwin.DataFattura.split('T');
        const giorno = dataArr[0];
        const oraTimeOffset = dataArr[1];
        const oraTime = oraTimeOffset.split('+');
        dataFormatted = `${giorno} ${oraTime[0]}`;
        dataMese = new Date(dataFormatted).getMonth() + 1;
      }

      return {
        AnnoFattura: fQwin.AnnoFattura,
        mese_num: dataMese,
        NumeroFattura: fQwin.NumeroFattura,
        SerieFattura: fQwin.SerieFattura,
        DataFattura: dataFormatted,
        FatturaEsportata: fQwin.FatturaEsportata,
        CausaleMagazzino: fQwin.CausaleMagazzino,
        CodiceCliente: fQwin.CodiceCliente,
        CodiceSede: fQwin.CodiceSede,
        CodiceValuta: fQwin.CodiceValuta,
        CodicePagamento: fQwin.CodicePagamento,
        CodiceBanca: fQwin.CodiceBanca,
        CodiceAgenzia: fQwin.CodiceAgenzia,
        CodiceIBAN: fQwin.CodiceIBAN,
        CodiceAgente: fQwin.CodiceAgente,
        Sconto_1_Chiusura: fQwin.Sconto1Chiusura,
        Sconto_2_Chiusura: fQwin.Sconto2Chiusura,
        Sconto_Pagamento: fQwin.ScontoPagamento,
        Lordo_Merce: fQwin.LordoMerce,
        Netto_Merce: fQwin.NettoMerce,
        Spese_Incasso: fQwin.SpeseIncasso,
        Spese_Trasporto: fQwin.SpeseTrasporto,
        Spese_Accessorie: fQwin.SpeseAccessorie,
        Importo_Bolli: fQwin.ImportoBolli,
        Ind_Addebito_Bolli: fQwin.IndAddebitoBolli,
        Ind_Addebito_Spese: fQwin.IndAddebitoSpese,
        Riferimento: fQwin.Riferimento,
        Annotazioni: fQwin.Annotazioni,
        Cod_IVA_1: fQwin.CodIva1,
        Cod_IVA_2: fQwin.CodIva2,
        Cod_IVA_3: fQwin.CodIva3,
        Cod_IVA_4: fQwin.CodIva4,
        Cod_IVA_5: fQwin.CodIva5,
        Imponibile_1: fQwin.Imponibile1,
        Imponibile_2: fQwin.Imponibile2,
        Imponibile_3: fQwin.Imponibile3,
        Imponibile_4: fQwin.Imponibile4,
        Imponibile_5: fQwin.Imponibile5,
        IVA_1: fQwin.Iva1,
        IVA_2: fQwin.Iva2,
        IVA_3: fQwin.Iva3,
        IVA_4: fQwin.Iva4,
        IVA_5: fQwin.Iva5,
        Totale_Imponibile: fQwin.TotaleImponibile,
        Totale_IVA: fQwin.TotaleIva,
        Totale_Documento: fQwin.TotaleDocumento,
        Acconto: fQwin.Acconto,
        Contrassegno: fQwin.Contrassegno,
        Imponibile_Omaggio: fQwin.ImponibileOmaggio,
        Imponibile_Provvigio: fQwin.ImponibileProvvigio,
        Importo_Provvigioni: fQwin.ImportoProvvigioni
      };
    });

    const toInsert = [];
    const toUpdate = [];
    for (let j = 0; j < fattureSapere.length; j += 1) {
      const fattura = fattureSapere[j];
      const found = await FattureTestate.findOne({
        attributes: ['id'],
        where: {
          AnnoFattura: fattura.AnnoFattura,
          NumeroFattura: fattura.NumeroFattura
        },
        raw: true
      });
      if (found) {
        log.info(`Found Fattura with id ${found.id}, to be updated`);
        toUpdate.push({ id: found.id, ...fattura });
      } else {
        log.info(`Not found fattura ${fattura.AnnoFattura} n. ${fattura.NumeroFattura}, to be inserted`);
        toInsert.push(fattura);
      }
    }

    const resultInsert = await FattureTestate.bulkCreate(toInsert);
    const resultUpdate = await FattureTestate.bulkCreate(toUpdate, { updateOnDuplicate: ['id'] });
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK. Fatture calcolate per anno: ${anno}.`, '[OK] Sapere Temprasud - Fatture Testate Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job fatture testate per la : ${error.message}`;
    await sendMail(message, `[ERROR] Sapere Temprasud - Fatture Testate Job. Fatture Anno ${anno}`);
  }
  // process.exit(0);
};

const getFatture = async (anno) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/fatture?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da=${anno}-01-01&a=${anno}-12-31`
  );

  if (response && response.status === 200) {
    return response.data;
  }

  return [];
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

const run = async () => {
  const anno = moment().year();
  await jobFattureTestate(anno);
};

run();
