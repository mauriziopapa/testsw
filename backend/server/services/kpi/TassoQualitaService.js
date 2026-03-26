/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const { buildDataWithMovingAverage } = require('../../lib/moving-average');

const TargetService = require('./TargetService');
const RepartiService = require('../RepartiService');
const ImpiantiAnagService = require('../ImpiantiAnagService');
const ImpiantiService = require('../ImpiantiService');
const KpiProduzioneService = require('../KpiProduzioneService');

const {
  ORE_PRODUTTIVE,
  ORE_FUNZIONAMENTO_EFFETTIVO,
  ORE_FUNZIONAMENTO_EFFETTIVO_IND
} = require('../../models/bi/KPIConstants');

const BIConstants = require('../../models/bi/BIConstants');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const { FORMAT_DATE } = require('../../lib/time');

const log = config.log();

module.exports.getKpiValuesReparti = async (filters) => {
  const self = this;

  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { kpi_id } = filters;

  const promises = [];
  promises.push(RepartiService.getReparti(filters));
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [reparti, target] = await Promise.all(promises);

  const dataPromises = reparti.map((reparto) => buildDataReparti(dal, al, reparto.reparto, target, self));
  const dataValues = await Promise.all(dataPromises);

  return dataValues;
};

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { reparto, kpi_id } = filters;
  const callbackOptions = {
    options: {
      dal,
      al,
      target: inputTarget,
      kpi_id,
      reparto
    },
    callbacks: {
      buildData: buildData
    }
  };
  const result = await buildDataWithMovingAverage(callbackOptions);
  return result;
};

module.exports.calculateValoreMedio = async (dal, al, reparto) => {
  let impianti = [];
  let valoreKpiProd = 0;
  let impiantiVal = 0;
  if (!reparto) {
    valoreKpiProd = await KpiProduzioneService.getValoreKpiProduzione(dal, al, ORE_PRODUTTIVE, BIConstants.IND.label);
    impiantiVal = await KpiProduzioneService.getValoreKpiProduzione(
      dal,
      al,
      ORE_FUNZIONAMENTO_EFFETTIVO_IND,
      BIConstants.IND.label
    );
  } else {
    valoreKpiProd = await KpiProduzioneService.getValoreKpiProduzione(dal, al, ORE_PRODUTTIVE, reparto);
    impianti = await ImpiantiAnagService.findAllByGruppo(reparto);
    const impiantiIds = impianti.map((impianto) => impianto.id);
    impiantiVal = await ImpiantiService.getSommaValoriKpiImpianti(dal, al, ORE_FUNZIONAMENTO_EFFETTIVO, impiantiIds);
  }

  if (impiantiVal === 0) {
    return 0;
  }

  const perc_valore = (valoreKpiProd / impiantiVal) * 100;
  return perc_valore;
};

async function buildData({ row, reparto, target }) {
  const kpiValues = await getKpi(row, reparto);
  if (!kpiValues) {
    return {
      label: row.label,
      val: 0,
      val_medio: 0,
      target
    };
  }

  return {
    label: row.label,
    val: (kpiValues.val * 100).toFixed(2),
    val_medio: 0,
    target
  };
}

async function buildDataReparti(dal, al, reparto, target, self) {
  let avg = 0;
  let avgPrec = 0;
  avg = await self.calculateValoreMedio(dal, al, reparto);

  const dalPrec = moment(dal).subtract(1, 'year').format(FORMAT_DATE);
  const alPrec = moment(al).subtract(1, 'year').format(FORMAT_DATE);
  avgPrec = await self.calculateValoreMedio(dalPrec, alPrec, reparto);

  return {
    label: reparto,
    val: avg.toFixed(2),
    val_prec: avgPrec.toFixed(2),
    target
  };
}

async function getKpi(row, reparto) {
  if (!reparto) {
    reparto = BIConstants.IND.label;
  }

  const query = `
  SELECT 
    ifnull(val, 0) AS val 
  FROM kpi_produzione
  WHERE 
    kpi = 29 AND 
    anno = :anno AND mese = :mese AND reparto = :reparto`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { anno: row.anno, mese: row.mese, reparto },
    type: QueryTypes.SELECT
  });
  return kpi[0];
}
