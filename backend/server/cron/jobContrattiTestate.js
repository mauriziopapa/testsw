/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const axios = require('axios');
const moment = require('moment');
const { Op } = require('sequelize');

const config = require('../config').jobFatture;
const { sendMail } = require('../lib/mailer');

const ContrattiTestate = require('../models/bi/ContrattiTestate');
const Commessa = require('../models/bi/Commessa');
const ContrattiRighe = require('../models/bi/ContrattiRighe');

const log = config.log();

const jobContrattiTestate = async (anno) => {
  const startTime = new Date();

  try {
    const contratti = await getContrattiFromCommesse(anno);

    const contrattiQwin = [];
    for (let i = 0; i < contratti.length; i += 1) {
      const contratto = contratti[i];
      const contrattoQwin = await getContratto(contratto);
      if (contrattoQwin && contrattoQwin.length !== 0) {
        contrattiQwin.push(contrattoQwin);
      }
    }

    const contrattiSapere = contrattiQwin.map((fQwin) => {
      // no time to make it better converting "2023-02-28T00:00:00+01:00" to keep constistency with db
      let dataFormatted = null;
      if (fQwin.DataCreazione != null) {
        const dataArr = fQwin.DataCreazione.split('T');
        const giorno = dataArr[0];
        dataFormatted = `${giorno}`;
      }

      return {
        IDContratto: fQwin.IDContratto,
        IDCliente: fQwin.IDCliente,
        IDArticolo: fQwin.IDArticolo,
        ProgressivoContratto: fQwin.ProgressivoContratto,
        NrRevisione: fQwin.NrRevisione,
        DescrizioneContratto: fQwin.DescrizioneContratto,
        ContrattoAttivo: fQwin.ContrattoAttivo,
        CodiceReparto: fQwin.CodiceReparto,
        Ciclo: fQwin.Ciclo,
        IDCentro: fQwin.IDCentro,
        Priorità: fQwin.Priorità,
        PesoIdealeCarica: fQwin.PesoIdealeCarica,
        NormeRif: fQwin.NormeRif,
        IDPianoCampionamento: fQwin.IDPianoCampionamento,
        IDConfezionamento: fQwin.IDConfezionamento,
        IndiceRevisione: fQwin.IndiceRevisione,
        Capitolato: fQwin.Capitolato,
        SpecificheControllo: fQwin.SpecificheControllo,
        NoteDaStampare: fQwin.NoteDaStampare,
        NoteInterne: fQwin.NoteInterne,
        NoteDatiVecchi: fQwin.NoteDatiVecchi,
        NoteCollaudo: fQwin.NoteCollaudo,
        NoteRiesame: fQwin.NoteRiesame,
        DataRevisione: fQwin.DataRevisione,
        DataCreazione: dataFormatted,
        IDOperatoreRevisione: fQwin.IDOperatoreRevisione,
        IDOperatore: fQwin.IDOperatore,
        DataOperatore: fQwin.DataOperatore,
        NrUtilizzi: fQwin.NrUtilizzi,
        DataUltimoUtilizzo: fQwin.DataUltimoUtilizzo,
        StampaSchedaLaboratorio: fQwin.StampaSchedaLaboratorio,
        GruppoStatistico: fQwin.GruppoStatistico,
        Offerta: fQwin.Offerta,
        IDCriticita: fQwin.IDCriticita,
        ConControlloCondizionale: fQwin.ConControlloCondizionale,
        ControlloCondizionalePerColata: fQwin.ControlloCondizionalePerColata,
        ControlloCondizionaleLimiteFornate: fQwin.ControlloCondizionaleLimiteFornate,
        ControlloCondizionaleLimiteGiorni: fQwin.ControlloCondizionaleLimiteGiorni,
        ControlloCondizionaleLimiteAvviso: fQwin.ControlloCondizionaleLimiteAvviso,
        IDSettoreApplicativo: fQwin.IDSettoreApplicativo,
        PercorsoDisegnoTecnico: fQwin.PercorsoDisegnoTecnico,
        PezziIdealiCarica: fQwin.PezziIdealiCarica,
        IDMateriale: fQwin.IDMateriale,
        MetalloCliente: fQwin.MetalloCliente,
        PesoPezzo: fQwin.PesoPezzo,
        SuperficiePezzo: fQwin.SuperficiePezzo,
        Posizionamento: fQwin.Posizionamento,
        CategoriaPosizionamento: fQwin.CategoriaPosizionamento,
        ClassePosizionamento: fQwin.ClassePosizionamento,
        PzOraPosizionamento: fQwin.PzOraPosizionamento,
        PzOraRimozione: fQwin.PzOraRimozione,
        MarcaturaPrevista: fQwin.MarcaturaPrevista,
        PrezzoMedioVendita: fQwin.PrezzoMedioVendita
      };
    });

    const toInsert = [];
    const toUpdate = [];
    for (let j = 0; j < contrattiSapere.length; j += 1) {
      const contratto = contrattiSapere[j];
      const found = await ContrattiTestate.findOne({
        attributes: ['IDContratto', 'IDCliente'],
        where: {
          IDContratto: contratto.IDContratto,
          IDCliente: contratto.IDCliente
        },
        raw: true
      });
      if (found) {
        log.info(`Found Contratto with id ${found.IDContratto} and ${found.IDCliente}, to be updated`);
        toUpdate.push({ IDContratto: found.IDContratto, ...contratto });
      } else {
        log.info(`Not found contratto ${contratto.IDContratto} and ${contratto.IDCliente}, to be inserted`);
        toInsert.push(contratto);
      }
    }

    const resultInsert = await ContrattiTestate.bulkCreate(toInsert);
    const resultUpdate = await ContrattiTestate.bulkCreate(toUpdate, { updateOnDuplicate: ['IDContratto'] });

    const contrattiRigheSapere = contrattiQwin.map((fQwin) => {
      if (fQwin.ContrattiRighes && fQwin.ContrattiRighes.length > 0) {
        return fQwin.ContrattiRighes.map((riga) => ({
          IDContratto: riga.IDContratto,
          Sequenza: riga.Sequenza,
          IDLavorazione: riga.IDLavorazione,
          InFattura: riga.InFattura,
          InBoll: riga.InBoll,
          Programma: riga.Programma || '',
          IDCentro: riga.IDCentro || 0,
          Note: riga.Note,
          LavorazioneSuCarica: riga.LavorazioneSuCarica,
          LavorazioneSuCommessa: riga.LavorazioneSuCommessa,
          MinutiLavorati: riga.MinutiLavorati,
          PezziLavorati: riga.PezziLavorati,
          KgLavorati: riga.KgLavorati,
          PezziPerOra: riga.PezziPerOra,
          OreImpegnate: riga.OreImpegnate,
          TempoAttrezzaggio: riga.TempoAttrezzaggio,
          ColpiPerPezzo: riga.ColpiPerPezzo,
          PercorsoIsola: riga.PercorsoIsola,
          NrAlternativa: riga.NrAlternativa,
          DescrAlternativa: riga.DescrAlternativa,
          IDAllegato1: riga.IDAllegato1,
          IDAllegato2: riga.IDAllegato2
        }));
      }
      return [];
    });
    const righeToInsert = contrattiRigheSapere.flatMap((a) => a);
    const resultRigheInsert = await ContrattiRighe.bulkCreate(righeToInsert);

    const finishTime = new Date();
    const diffTime = difference(startTime, finishTime);
    await sendMail(`TUTTO OK. Contratti calcolate per anno: ${anno}.`, '[OK] Sapere Temprasud - Contratti Testate Job');
    log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job contratti testate: ${error.message}. Stack: ${error.stack}`;
    await sendMail(message, `[ERROR] Sapere Temprasud - Contratti Testate Job. Contratti Anno ${anno}`);
  }
  // process.exit(0);
};

// Method to get distinct CodiceContratto for 2024
async function getContrattiFromCommesse(anno) {
  try {
    const results = await Commessa.findAll({
      attributes: [[Commessa.sequelize.fn('DISTINCT', Commessa.sequelize.col('CodiceContratto')), 'CodiceContratto']],
      where: {
        'Data Bolla': {
          [Op.gte]: new Date(`${anno}-01-01`),
          [Op.lt]: new Date(`${anno + 1}-01-01`)
        }
      }
    });

    // Map the results to extract CodiceContratto values
    const distinctCodiceContratto = results.map((result) => result.get('CodiceContratto'));
    return distinctCodiceContratto;
  } catch (error) {
    log.error(`Error fetching distinct CodiceContratto for ${anno}: ${error.message}`, error);
    throw error;
  }
}

const getContratto = async (contratto) => {
  const response = await axios.get(
    `http://10.64.21.250:18666/api/exportdati/contratti?apikey=84aeb933c2a42c4936e1ede8e9bbd58b&contratto=${contratto}`
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
  await jobContrattiTestate(anno);
};

run();
