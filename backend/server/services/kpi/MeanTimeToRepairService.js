/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const ImpiantiAnagService = require('../ImpiantiAnagService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const KPI_6_7 = [6, 7];
const KPI_44_45 = [44, 45];

module.exports.getDebugData = async (filters) => {
  const gruppo_reparto = filters.reparto;

  if (gruppo_reparto) {
    const reparti = await ImpiantiAnagService.findAllByGruppo(gruppo_reparto);
    const promises = reparti.map((reparto) =>
      getDataForKpiImpianti(reparto.nome_impianto, filters.from, filters.to, filters.from, filters.to)
    );

    const dataValues = await Promise.all(promises);

    const output = reparti.map((reparto, i) => ({
      impianto: reparto.nome_impianto,
      ore_manu_straordinaria_guasto: dataValues[i][0],
      numero_di_guasti: dataValues[i][1],
      valore: dataValues[i][0] / dataValues[i][1],
      formula: 'ore_manu_straordinaria_guasto / numero_di_guasti'
    }));

    return output;
  }

  const reparti = await ImpiantiAnagService.findAllGruppi();
  const promises = reparti
    .filter((reparto) => !['TENIFER', 'POZZO', 'FVF', 'FVF-SZ', 'ALU'].includes(reparto.gruppo_impianto))
    .map((reparto) =>
      getDataForKpiReparti(reparto.gruppo_impianto, filters.from, filters.to, filters.from, filters.to)
    );

  const dataValues = await Promise.all(promises);

  const output = reparti
    .filter((reparto) => !['TENIFER', 'POZZO', 'FVF', 'FVF-SZ', 'ALU'].includes(reparto.gruppo_impianto))
    .map((reparto, i) => ({
      reparto: reparto.gruppo_impianto,
      ore_manu_straordinaria_guasto: dataValues[i][0],
      numero_di_guasti: dataValues[i][1],
      valore: dataValues[i][0] / dataValues[i][1],
      formula: 'ore_manu_straordinaria_guasto / numero_di_guasti'
    }));

  return output;
};

module.exports.getKpiValuesReparti = async (filters) => {
  const results = [];
  const inputTarget = filters.target;
  const { kpi_id } = filters;

  let promises = [];
  promises.push(ImpiantiAnagService.findAllGruppi());
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [reparti, target] = await Promise.all(promises);

  promises = reparti
    .filter((reparto) => !['TENIFER', 'POZZO', 'FVF', 'FVF-SZ', 'ALU'].includes(reparto.gruppo_impianto))
    .map((reparto) => buildDataReparto(reparto.gruppo_impianto, filters.from, filters.to, target));

  const dataValues = await Promise.all(promises);
  dataValues.map((d) => results.push(d));
  return results;
};

async function buildDataReparto(reparto, dal, al, target) {
  const fromYear_prec = parseInt(dal.split('-')[0]) - 1;
  const toYear_prec = parseInt(al.split('-')[0]) - 1;

  const dal_prec = `${fromYear_prec}-${dal.split('-')[1]}`;
  const al_prec = `${toYear_prec}-${al.split('-')[1]}`;

  const data = await getDataForKpiReparti(reparto, dal, al, dal_prec, al_prec);

  const num = data[0];
  const den = data[1];
  const num_prec = data[2];
  const den_prec = data[3];

  let val = 0;
  let val_prec = 0;
  if (den > 0) {
    val = (num / den).toFixed(2);
  }
  if (den_prec > 0) {
    val_prec = (num_prec / den_prec).toFixed(2);
  }
  return {
    label: reparto,
    val: parseFloat(val),
    val_prec: parseFloat(val_prec),
    target
  };
}

async function getDataForKpiReparti(reparto, dal, al, dal_prec, al_prec) {
  const promises = [];
  // prendo la somma delle ore spento e standby per manu stra / guasto
  promises.push(getKpiReparto(reparto, dal, al, KPI_6_7));
  // prendo la somma del numero di guasti
  promises.push(getKpiReparto(reparto, dal, al, KPI_44_45));
  // prendo la somma delle ore spento per manu stra / guasto dell'anno precedente
  promises.push(getKpiReparto(reparto, dal_prec, al_prec, KPI_6_7));
  // prendo la somma del numero di guasti (conto 1 per ogni ora per impianto per mese) dell'anno precedente
  promises.push(getKpiReparto(reparto, dal_prec, al_prec, KPI_44_45));
  const data = await Promise.all(promises);
  return data;
}

async function getKpiReparto(reparto, dal, al, kpis) {
  const fromYear = dal.split('-')[0];
  const fromMonth = dal.split('-')[1];
  const toYear = al.split('-')[0];
  const toMonth = al.split('-')[1];

  const query_kpi = `
  SELECT 
    SUM(ifnull(impianti_crud.valore, 0)) AS val, 
    impianti_crud.anno, 
    impianti_anag.gruppo_impianto 
  FROM impianti_crud LEFT JOIN impianti_anag ON impianti_crud.fk_impianto = impianti_anag.id
  WHERE (impianti_crud.anno > :fromYear OR (impianti_crud.anno = :fromYear AND impianti_crud.mese >= :fromMonth)) 
    AND (impianti_crud.anno < :toYear OR (impianti_crud.anno = :toYear AND impianti_crud.mese <= :toMonth)) 
    AND impianti_crud.fk_impianto IN (SELECT ia.id FROM impianti_anag ia WHERE ia.gruppo_impianto = :reparto)
    AND fk_kpi in (:kpis)
  `;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: {
      reparto,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
      kpis
    },
    type: QueryTypes.SELECT
  });
  return kpi[0].val ? kpi[0].val : 0;
}

module.exports.getKpiValues = async (filters) => {
  const results = [];
  const inputTarget = filters.target;
  const gruppo_reparto = filters.reparto;
  const kpiId = filters.kpi_id;

  let promises = [];
  promises.push(ImpiantiAnagService.findAllByGruppo(gruppo_reparto));
  promises.push(TargetService.getTarget(inputTarget, kpiId));
  const [reparti, target] = await Promise.all(promises);

  promises = reparti.map((reparto) => buildData(reparto.nome_impianto, filters.from, filters.to, target));

  const dataValues = await Promise.all(promises);
  dataValues.map((d) => results.push(d));
  return results;
};

async function buildData(impianto, dal, al, target) {
  const fromYear_prec = parseInt(dal.split('-')[0]) - 1;
  const toYear_prec = parseInt(al.split('-')[0]) - 1;

  const dal_prec = `${fromYear_prec}-${dal.split('-')[1]}`;
  const al_prec = `${toYear_prec}-${al.split('-')[1]}`;

  const data = await getDataForKpiImpianti(impianto, dal, al, dal_prec, al_prec);

  const num = data[0];
  const den = data[1];
  const num_prec = data[2];
  const den_prec = data[3];

  let val = 0;
  let val_prec = 0;
  if (den > 0) {
    val = (num / den).toFixed(2);
  }
  if (den_prec > 0) {
    val_prec = (num_prec / den_prec).toFixed(2);
  }
  return {
    label: impianto,
    val: parseFloat(val),
    val_prec: parseFloat(val_prec),
    target
  };
}

async function getDataForKpiImpianti(impianto, dal, al, dal_prec, al_prec) {
  const promises = [];
  // prendo la somma delle ore spento e standby per manu stra / guasto
  promises.push(getKpi(impianto, dal, al, KPI_6_7));
  // prendo la somma del numero di guasti
  promises.push(getKpi(impianto, dal, al, KPI_44_45));
  // prendo la somma delle ore spento per manu stra / guasto dell'anno precedente
  promises.push(getKpi(impianto, dal_prec, al_prec, KPI_6_7));
  // prendo la somma del numero di guasti (conto 1 per ogni ora per impianto per mese) dell'anno precedente
  promises.push(getKpi(impianto, dal_prec, al_prec, KPI_44_45));
  const data = await Promise.all(promises);
  return data;
}

async function getKpi(impianto, dal, al, kpis) {
  const fromYear = dal.split('-')[0];
  const fromMonth = dal.split('-')[1];
  const toYear = al.split('-')[0];
  const toMonth = al.split('-')[1];

  const query_kpi = `
  SELECT 
    SUM(ifnull(impianti_crud.valore, 0)) AS val, 
    impianti_crud.anno, 
    impianti_anag.nome_impianto
  FROM impianti_crud LEFT JOIN impianti_anag 
      ON impianti_crud.fk_impianto = impianti_anag.id
  WHERE (impianti_crud.anno > :fromYear OR (impianti_crud.anno = :fromYear AND impianti_crud.mese >= :fromMonth)) 
  AND
  (impianti_crud.anno < :toYear OR (impianti_crud.anno = :toYear AND impianti_crud.mese <= :toMonth)) 
  AND impianti_anag.nome_impianto = :impianto 
  AND fk_kpi in (:kpis)
  `;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: {
      impianto,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
      kpis
    },
    type: QueryTypes.SELECT
  });
  return kpi[0].val ? kpi[0].val : 0;
}
