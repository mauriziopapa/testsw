/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');

const config = require('../config').jobKpiTabelle;

const { dbBi } = require('../lib/db');

const log = config.log();

module.exports.calculateOreAcceso = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const spento_no_materiale = getVal(somme, 21);
  const spento_manutenzione = getVal(somme, 5);
  const manutenzione_straord = getVal(somme, 6);
  const festivita = getVal(somme, 20);
  const val = capacita_teorica - spento_no_materiale - spento_manutenzione - manutenzione_straord  - festivita;
  return val;
};

module.exports.calculateOreFunzEffettivoProsys = (somme) => {
  const val = getVal(somme, 30);
  return val;
};

module.exports.calculateOreFunzEffettivoDiControllo = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const spento_no_materiale = getVal(somme, 21);
  const spento_manutenzione = getVal(somme, 5);
  const manutenzione_straord = getVal(somme, 6);
  const festivita = getVal(somme, 20);
  const ore_standby_nomateriale = getVal(somme, 22);
  const ore_standby_nomanopera = getVal(somme, 23);
  const ore_standby_manstrao = getVal(somme, 7);
  const val =
    capacita_teorica -
    spento_no_materiale -
    spento_manutenzione -
    manutenzione_straord -
    festivita -
    ore_standby_nomateriale -
    ore_standby_nomanopera -
    ore_standby_manstrao;
  return val;
};

module.exports.calculateOreProduttive = (somme) => {
  const ore_funz_effettivo = this.calculateOreFunzEffettivoProsys(somme);
  const ore_rilavorazioni = getVal(somme, 25);
  const ore_campionature = getVal(somme, 26);
  const val = ore_funz_effettivo - ore_rilavorazioni - ore_campionature;
  return val;
};

module.exports.calculateOreProduttiveDiControllo = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const spento_no_materiale = getVal(somme, 21);
  const spento_manutenzione = getVal(somme, 5);
  const manutenzione_straord = getVal(somme, 6);
  const spento_guasti = getVal(somme, 44);
  const festivita = getVal(somme, 20);
  const ore_standby_nomateriale = getVal(somme, 22);
  const ore_standby_nomanopera = getVal(somme, 23);
  const ore_standby_manstrao = getVal(somme, 7);
  const ore_rilavorazioni = getVal(somme, 25);
  const ore_campionature = getVal(somme, 26);
  const val =
    capacita_teorica -
    spento_no_materiale -
    spento_manutenzione -
    manutenzione_straord -
    spento_guasti -
    festivita -
    ore_standby_nomateriale -
    ore_standby_nomanopera -
    ore_rilavorazioni -
    ore_campionature -
    ore_standby_manstrao;
  return val;
};

module.exports.calculateOEE = (somme) => {
  const tasso_qualita = this.calculateTassoQualita(somme);
  const eff_prod = this.calculateEfficienzaProduttiva(somme);
  const aviability = this.calculateEquipAvail(somme);
  const val = (parseFloat(tasso_qualita) * parseFloat(eff_prod) * parseFloat(aviability)).toFixed(3);
  return val;
};

module.exports.calculateCapacitaPratica = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const ore_acceso = this.calculateOreAcceso(somme);

  let val = 0;
  if (capacita_teorica > 0) {
    val = (ore_acceso / capacita_teorica).toFixed(3);
  }
  return val;
};

module.exports.calculateEfficienzaProduttiva = (somme) => {
  const ore_funz_effettivo = this.calculateOreFunzEffettivoProsys(somme);
  const ore_acceso = this.calculateOreAcceso(somme);

  let val = 0;
  if (ore_acceso > 0) {
    val = (ore_funz_effettivo / ore_acceso).toFixed(3);
  }
  return val;
};

module.exports.calculateTassoQualita = (somme) => {
  const ore_produttive = this.calculateOreProduttive(somme);
  const ore_funz_effettivo = this.calculateOreFunzEffettivoProsys(somme);

  let val = 0;
  if (ore_funz_effettivo > 0) {
    val = (ore_produttive / ore_funz_effettivo).toFixed(3);
  }
  return val;
};

module.exports.calculateEquipAvail = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const spento_manutenzione = getVal(somme, 5);
  const spento_manstrao = getVal(somme, 6);
  const standby_manstrao = getVal(somme, 7);
  const val = (1 - (spento_manutenzione + spento_manstrao + standby_manstrao) / capacita_teorica).toFixed(3);
  return val;
};

module.exports.calculateEfficaciaManutenzione = (somme) => {
  const ore_standby_guasto = getVal(somme, 7);
  const ore_acceso = this.calculateOreAcceso(somme);

  let val = 0;
  if (ore_acceso > 0) {
    val = (1 - ore_standby_guasto / ore_acceso).toFixed(3);
  }
  return val;
};

module.exports.calculateSaturazioneCommerciale = (somme) => {
  const capacita_teorica = getVal(somme, 31);
  const festivita = getVal(somme, 20);
  const spento_no_materiale = getVal(somme, 21);
  const man_prog = getVal(somme, 5);
  const man_strao = getVal(somme, 6);

  const val = ((capacita_teorica - spento_no_materiale - man_prog - man_strao - festivita) / capacita_teorica).toFixed(
    3
  );
  return val;
};

const getVal = (somme, kpi) => somme.filter((somma) => somma.kpi_id === kpi)[0].somma || 0;

module.exports.getValoriKpiProduzione = async (anno, mese, reparto, kpi) => {
  const sql = `
  SELECT
    val
  FROM
    kpi_produzione
  WHERE
    anno = :anno
    AND mese = :mese
    AND reparto = :reparto
    AND kpi = :kpi`;

  const valori = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, reparto, kpi },
    type: QueryTypes.SELECT
  });

  if (valori.length === 0) {
    return 0;
  }

  return valori[0].val;
};

module.exports.getValoriImpianto = async (anno, mese, fk_impianto, fk_kpi) => {
  const sql = `
  SELECT
    valore
  FROM
    impianti_crud
  WHERE
    anno = :anno
    AND mese = :mese
    AND fk_impianto = :fk_impianto
    AND fk_kpi = :fk_kpi`;

  const valori = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, fk_impianto, fk_kpi },
    type: QueryTypes.SELECT
  });

  if (valori.length === 0) {
    return 0;
  }

  return valori[0].valore;
};

module.exports.getSommaValoriKpiImpianti = async (from, to, kpi, impianti) => {
  const query = `
  SELECT SUM(ifnull(valore, 0)) as val
  FROM impianti_crud ic 
  WHERE fk_kpi = :kpi 
  AND fk_impianto IN (:impianti)
  AND STR_TO_DATE(CONCAT(anno, '-', mese, '-01'), '%Y-%m-%d') BETWEEN :from and :to `;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { kpi, impianti, from, to },
    type: QueryTypes.SELECT
  });
  return result[0] && result[0].val ? result[0].val : 0;
};

module.exports.updateKpiProduzione = async (val, anno, mese, reparto, kpi) => {
  const sql = `
  UPDATE
    kpi_produzione
  SET
    val = :val
  WHERE
    anno = :anno
    AND mese = :mese
    AND reparto = :reparto
    AND kpi = :kpi
    AND forzatura_manuale != 1`;

  const valore = await dbBi.sequelizeBi.query(sql, {
    replacements: { val, anno, mese, reparto, kpi },
    type: QueryTypes.UPDATE
  });

  return valore;
};

module.exports.updateImpiantiCrud = async (val, anno, mese, impianto, kpi) => {
  const sql = `
  UPDATE
    impianti_crud
  SET
    valore = :val
  WHERE
    anno = :anno
    AND mese = :mese
    AND fk_impianto = :impianto
    AND fk_kpi = :kpi
    AND forzatura_manuale != 1`;

  const valore = await dbBi.sequelizeBi.query(sql, {
    replacements: { val, anno, mese, impianto, kpi },
    type: QueryTypes.UPDATE
  });

  return valore;
};
