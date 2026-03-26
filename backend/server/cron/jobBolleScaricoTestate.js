/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');

const config = require('../config').jobFatture;
const { sendMail } = require('../lib/mailer');
const { dbBi } = require('../lib/db');

const BolleScaricoTestate = require('../models/bi/BolleScaricoTestate');

const log = config.log();

const jobBolleScaricoTestate = async (anno) => {
  const startTime = new Date();

  try {
    const bolleQwin = await getBolle(anno);
    const bolleSapere = bolleQwin.map((bQwin) => {
      // no time to make it better converting "2023-02-28T00:00:00+01:00" to keep constistency with db
      let dataFormatted = null;
      let dataMese = null;
      if (bQwin.DataBolla != null) {
        const dataArr = bQwin.DataBolla.split('T');
        const giorno = dataArr[0];
        const oraTimeOffset = dataArr[1];
        const oraTime = oraTimeOffset.split('+');
        dataFormatted = `${giorno} ${oraTime[0]}`;
        dataMese = new Date(dataFormatted).getMonth() + 1;
      }

      return {
        AnnoBolla: bQwin.AnnoBolla,
        mese_num: dataMese,
        SerieBolla: bQwin.SerieBolla,
        NumeroBolla: bQwin.NumeroBolla,
        DataBolla: dataFormatted,
        ClienteCodice: bQwin.ClienteCodice,
        ClienteDescrizione: bQwin.ClienteDescrizione,
        ClienteIndirizzo: bQwin.ClienteIndirizzo,
        ClienteLocalita: bQwin.ClienteLocalita,
        ClienteProvincia: bQwin.ClienteProvincia,
        ClienteCAP: bQwin.ClienteCAP,
        PartitaIva: bQwin.PartitaIva,
        DestDiversa: bQwin.DestDiversa,
        IndirizzoDiverso: bQwin.IndirizzoDiverso,
        LocalitaDiversa: bQwin.LocalitaDiversa,
        ProvinciaDiversa: bQwin.ProvinciaDiversa,
        CapDiverso: bQwin.CapDiverso,
        MezzoDiTrasporto: bQwin.MezzoDiTrasporto,
        CausaleTrasporto: bQwin.CausaleTrasporto,
        CausaleTrasportoDescrizione: bQwin.CausaleTrasportoDescrizione,
        Porto: bQwin.Porto,
        PortoDescrizione: bQwin.PortoDescrizione,
        Vettore: bQwin.Vettore,
        VettoreRagSoc: bQwin.VettoreRagSoc,
        VettoreIndirizzo: bQwin.VettoreIndirizzo,
        VettoreLocalita: bQwin.VettoreLocalita,
        PesoLordo: bQwin.PesoLordo,
        PesoNetto: bQwin.PesoNetto,
        NumeroColli: bQwin.NumeroColli,
        DataDiTrasporto: bQwin.DataDiTrasporto,
        OraDiTrasporto: bQwin.OraDiTrasporto,
        BollaEsportata: bQwin.BollaEsportata,
        Valorizzata: bQwin.Valorizzata,
        TotaleBolla: bQwin.TotaleBolla,
        NumeroFattura: bQwin.NumeroFattura,
        DataFattura: bQwin.DataFattura,
        IsEvasa: bQwin.IsEvasa,
        TipoMezzo: bQwin.TipoMezzo,
        MezzoMittente: bQwin.MezzoMittente,
        MezzoDestinatario: bQwin.MezzoDestinatario,
        MezzoVettore: bQwin.MezzoVettore,
        AspettoBeni: bQwin.AspettoBeni,
        Annotazioni: bQwin.Annotazioni
      };
    });

    const toInsert = [];
    const toUpdate = [];
    for (let j = 0; j < bolleSapere.length; j += 1) {
      const bolla = bolleSapere[j];
      const found = await BolleScaricoTestate.findOne({
        attributes: ['id'],
        where: {
          AnnoBolla: bolla.AnnoBolla,
          NumeroBolla: bolla.NumeroBolla
        },
        raw: true
      });
      if (found) {
        log.info(`Found Fattura with id ${found.id}, to be updated`);
        toUpdate.push({ id: found.id, ...bolla });
      } else {
        log.info(`Not found fattura ${bolla.AnnoBolla} n. ${bolla.NumeroBolla}, to be inserted`);
        toInsert.push(bolla);
      }
    }

    const attributesToUpdate = Object.keys(BolleScaricoTestate.tableAttributes).slice(1); // id column is not updated
    const resultInsert = await BolleScaricoTestate.bulkCreate(toInsert);
    const resultUpdate = await BolleScaricoTestate.bulkCreate(toUpdate, { updateOnDuplicate: attributesToUpdate });
    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(
      `TUTTO OK. Bolle Scarico calcolate per anno: ${anno}.`,
      '[OK] Sapere Temprasud - Bolle Scarico Testate Job'
    );
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job bolle scarico per la : ${error.message}`;
    await sendMail(message, `[ERROR] Sapere Temprasud - Bolle Scarico Job. Bolle Anno ${anno}`);
  }
  // process.exit(0);
};

const getBolle = async (anno) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/bollescarico?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&da=${anno}-01-01&a=${anno}-12-31`
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
  await jobBolleScaricoTestate(anno);
};

run();
