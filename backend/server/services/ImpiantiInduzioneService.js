/* eslint-disable max-len */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const config = require('../config').jobKpiTabelle;

const { dbBi } = require('../lib/db');

const ImpiantiService = require('./ImpiantiService');
const BIConstants = require('../models/bi/BIConstants');
const TeamsystemHrDipendentiCount = require('../models/bi/TeamsystemHrDipendentiCount');
const TeamsystemHrDipendenti = require('../models/bi/TeamsystemHrDipendenti');

const log = config.log();

module.exports.calculateCapacitaTeorica = async (anno, mese) => {
  log.info(`Calcolo il kpi=31 - (Capacità Teorica) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const sql = `
  UPDATE
    impianti_crud
  SET
    valore = 744
  WHERE
    anno = :anno
    AND mese = :mese
    AND fk_kpi = 31
    AND fk_impianto IN (18, 19, 20, 21)
  `;

  await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese },
    type: QueryTypes.UPDATE
  });
  log.info(
    `Aggiornato il kpi=31 - (Capacità Teorica) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=744`
  );
};

module.exports.calculateOreAcceso = async (anno, mese) => {
  log.info(`Calcolo il kpi=14 - (Ore Acceso) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const sql = `
  UPDATE
    kpi_produzione
  SET
    val = (
    SELECT
      IFNULL(SUM(ore), 0) as ore_acceso
    FROM
      teamsystemhr_ore
    WHERE
      matricola IN (
      SELECT
        matricola
      from
        teamsystemhr_dipendenti
      WHERE
        reparto = "INDU"
        AND azienda = "0000000102"
        AND licenziamento IS NULL
      )
      AND causale IN (
      SELECT
        causale
      from
        teamsystemhr_causali
      WHERE
        tipo = "ORE LAVORATE ORDINARIE" || tipo = "ORE STRAORDINARIO"
      )
      AND azienda = "0000000102"
      AND YEAR(data) = :anno
      AND MONTH(data) = :mese
      )
  WHERE
    anno = :anno
    AND mese = :mese
    AND kpi = 14
    AND reparto = :reparto
    AND forzatura_manuale = 0
  `;

  await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, reparto: BIConstants.IND.label },
    type: QueryTypes.UPDATE
  });
  log.info(`Aggiornato il kpi=14 - (Ore Acceso) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
};

module.exports.calculateMancanzaPersonale = async (anno, mese) => {
  log.info(`Calcolo il kpi=8 - (Mancanza Personale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const sql = `
  SELECT
    *
  FROM
    kpi_produzione kp
  WHERE
    reparto = :reparto
    AND kpi = 14
    AND anno = :anno
    AND mese = :mese
  `;

  const results = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  const ore_acceso = results.length > 0 ? results[0].val : 0;
  const num_dipendenti = await this.getDipendentiCount(anno, mese, { username: 'cronjob' });
  const val = (22 * 8 * num_dipendenti - ore_acceso).toFixed(3);

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 8);

  log.info(
    `Aggiornato il kpi=8 - (Mancanza Personale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateMancanzaMateriale = async (anno, mese) => {
  log.info(`Calcolo il kpi=21 - (Mancanza Materiale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);

  const ore_acceso = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 14);
  const capacita_teorica = await this.getSommaValoriImpiantiInduzione(anno, mese, 31);
  const festivita = await this.getSommaValoriImpiantiInduzione(anno, mese, 20);
  const no_personale = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 8);
  const man_prog = await this.getSommaValoriImpiantiInduzione(anno, mese, 5);
  const man_strao = await this.getSommaValoriImpiantiInduzione(anno, mese, 6);
  const campionature = await this.getSommaValoriImpiantiInduzione(anno, mese, 26);

  const val = capacita_teorica - festivita - no_personale - man_prog - man_strao - campionature - ore_acceso;

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 21);

  log.info(
    `Aggiornato il kpi=21 - (Mancanza Materiale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateOreFunzEffettivo = async (anno) => {
  log.info(`Calcolo il kpi=24 - (Ore Funzionamento Effettivo) per gli impianti di INDUZIONE per anno=${anno}`);
  const sql = `
  SELECT
    anno,
    mese,
    24 as kpi,
    tempo_setup + tempo_ind as ore_funz_eff,
    '${BIConstants.IND.label}' AS reparto
  FROM
    (
    SELECT
      anno,
      mese,
      r.TempoSetupMc as tempo_setup,
      r.TempoTempraInduzioneMc as tempo_ind
    FROM
      riepilogo_induzione AS r
    WHERE anno >= :anno
  ) as query
  `;

  const results = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  const promises = results.map((res) =>
    ImpiantiService.updateKpiProduzione(res.ore_funz_eff, res.anno, res.mese, res.reparto, res.kpi)
  );

  await Promise.all(promises);
  log.info(`Aggiornato il kpi=24 - (Ore Funzionamento Effettivo) per gli impianti di INDUZIONE per anno=${anno}`);
};

module.exports.calculateOreProduttive = async (anno, mese) => {
  log.info(`Calcolo il kpi=27 - (Ore Produttive) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const sql = `
  UPDATE
    kpi_produzione
  SET
    val = (
  SELECT
    (SELECT
      val as ore_funz_eff
    FROM
      kpi_produzione kp
    WHERE
      kpi = 24
      and reparto = :reparto
      AND anno = :anno
      AND mese = :mese) 
    - 
    (SELECT
      SUM(valore) as ore_rilavorazioni
    FROM
      impianti_crud ic
    WHERE
      fk_kpi = 25
      AND anno = :anno
      AND mese = :mese
      AND fk_impianto IN (18, 19, 20, 21))
    AS ore_produttive
      )
  WHERE
    anno = :anno
    AND mese = :mese
    AND kpi = 27
    AND reparto = :reparto
  `;

  await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, reparto: BIConstants.IND.label },
    type: QueryTypes.UPDATE
  });
  log.info(`Aggiornato il kpi=27 - (Ore Produttive) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
};

module.exports.calculatePerdite = async (anno, mese) => {
  log.info(
    `Calcolo il kpi=46,47,48,49,50,51,52,53,54 - (Perdite) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`
  );

  const sql = `
  SELECT  
    IFNULL(SUM(IFNULL(r.TempoMessaAPunto, 0)), 0)           AS TempoMessaAPunto,
    IFNULL(SUM(IFNULL(r.TempoCostruzioneInduttore, 0)), 0)  AS TempoCostruzioneInduttore,
    IFNULL(SUM(IFNULL(r.TempoRitardoLaboratorio, 0)), 0)    AS TempoRitardoLaboratorio,
    IFNULL(SUM(IFNULL(r.TempoAssenzaEnergia, 0)), 0)        AS TempoAssenzaEnergia,
    IFNULL(SUM(IFNULL(r.TempoPulizia, 0)), 0)               AS TempoPulizia,
    IFNULL(SUM(IFNULL(r.TempoGuasto, 0)), 0)                AS TempoGuasto,
    IFNULL(SUM(IFNULL(r.TempoProtezioni, 0)), 0)            AS TempoProtezioni,
    IFNULL(SUM(IFNULL(r.TempoControlliCricche, 0)), 0)      AS TempoControlliCricche,
    IFNULL(SUM(IFNULL(r.TempoAltreAttivita, 0)), 0)         AS TempoAltreAttivita
  FROM riepilogo_induzione AS r
  WHERE anno = :anno AND mese = :mese`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese },
    type: QueryTypes.SELECT
  });

  if (kpi.length > 0) {
    const tempoMessaAPunto = kpi[0].TempoMessaAPunto;
    const tempoCostruzioneInduttore = kpi[0].TempoCostruzioneInduttore;
    const tempoRitardoLaboratorio = kpi[0].TempoRitardoLaboratorio;
    const tempoAssenzaEnergia = kpi[0].TempoAssenzaEnergia;
    const tempoPulizia = kpi[0].TempoPulizia;
    const tempoGuasto = kpi[0].TempoGuasto;
    const tempoProtezioni = kpi[0].TempoProtezioni;
    const tempoControlliCricche = kpi[0].TempoControlliCricche;
    const tempoAltreAttivita = kpi[0].TempoAltreAttivita;

    await ImpiantiService.updateKpiProduzione(tempoMessaAPunto, anno, mese, BIConstants.IND.label, 46);
    await ImpiantiService.updateKpiProduzione(tempoCostruzioneInduttore, anno, mese, BIConstants.IND.label, 47);
    await ImpiantiService.updateKpiProduzione(tempoRitardoLaboratorio, anno, mese, BIConstants.IND.label, 48);
    await ImpiantiService.updateKpiProduzione(tempoAssenzaEnergia, anno, mese, BIConstants.IND.label, 49);
    await ImpiantiService.updateKpiProduzione(tempoPulizia, anno, mese, BIConstants.IND.label, 50);
    await ImpiantiService.updateKpiProduzione(tempoGuasto, anno, mese, BIConstants.IND.label, 51);
    await ImpiantiService.updateKpiProduzione(tempoProtezioni, anno, mese, BIConstants.IND.label, 52);
    await ImpiantiService.updateKpiProduzione(tempoControlliCricche, anno, mese, BIConstants.IND.label, 53);
    await ImpiantiService.updateKpiProduzione(tempoAltreAttivita, anno, mese, BIConstants.IND.label, 54);
    log.info(
      `Aggiornato il kpi=46,47,48,49,50,51,52,53,54 - (Perdite) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`
    );
  } else {
    log.info(`Non ho trovato Perdite per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  }
};

module.exports.calculateAltrePerdite = async (anno, mese) => {
  log.info(`Calcolo il kpi=55 - (Altre Perdite) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const ore_acceso = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 14);
  const ore_funz_effettivo = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 24);
  const tempoMessaAPunto = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 46);
  const tempoCostruzioneInduttore = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 47);
  const tempoRitardoLaboratorio = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 48);
  const tempoAssenzaEnergia = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 49);
  const tempoPulizia = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 50);
  const tempoGuasto = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 51);
  const tempoProtezioni = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 52);
  const tempoControlliCricche = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 53);
  const tempoAltreAttivita = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 54);

  const val = (
    ore_acceso -
    ore_funz_effettivo -
    tempoMessaAPunto -
    tempoCostruzioneInduttore -
    tempoRitardoLaboratorio -
    tempoAssenzaEnergia -
    tempoPulizia -
    tempoGuasto -
    tempoProtezioni -
    tempoControlliCricche -
    tempoAltreAttivita
  ).toFixed(3);

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 55);
  log.info(
    `Aggiornato il kpi=55 - (Altre Perdite) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateEfficienzaProduttiva = async (anno, mese) => {
  log.info(`Calcolo il kpi=1 - (Efficienza Produttiva) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const ore_funz_effettivo = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 24);
  const ore_acceso = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 14);
  const tempoGuasto = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 51);

  let val = 0;
  if (ore_acceso > 0) {
    val = ((ore_funz_effettivo + tempoGuasto) / ore_acceso).toFixed(3);
  }

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 1);
  log.info(
    `Aggiornato il kpi=1 - (Efficienza Produttiva) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateTassoQualita = async (anno, mese) => {
  log.info(`Calcolo il kpi=29 - (Tasso Qualita) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const ore_produttive = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 27);
  const ore_funz_effettivo = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 24);

  let val = 0;
  if (ore_funz_effettivo > 0) {
    val = (ore_produttive / ore_funz_effettivo).toFixed(3);
  }

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 29);
  log.info(
    `Aggiornato il kpi=29 - (Tasso Qualita) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateCapacitaPratica = async (anno, mese) => {
  log.info(`Calcolo il kpi=28 - (Capacita Pratica) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const capacita_teorica = await this.getSommaValoriImpiantiInduzione(anno, mese, 31);
  const ore_acceso = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 14);

  let val = 0;
  if (capacita_teorica > 0) {
    val = (ore_acceso / capacita_teorica).toFixed(3);
  }

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 28);
  log.info(
    `Aggiornato il kpi=28 - (Capacita Pratica) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateEquipmentAvailability = async (anno, mese) => {
  log.info(`Calcolo il kpi=3 - (Equipment Availability) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const capacita_teorica = await this.getSommaValoriImpiantiInduzione(anno, mese, 31);
  const man_prog = await this.getSommaValoriImpiantiInduzione(anno, mese, 5);
  const man_strao = await this.getSommaValoriImpiantiInduzione(anno, mese, 6);
  const tempoGuasto = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 51);

  const somma = man_prog + man_strao + tempoGuasto;

  let val = 0;
  if (capacita_teorica > 0) {
    val = 1 - (somma / capacita_teorica).toFixed(3);
  }

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 3);
  log.info(
    `Aggiornato il kpi=3 - (Equipment Availability) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateSaturazioneCommerciale = async (anno, mese) => {
  log.info(
    `Calcolo il kpi=4 - (Saturazione Commerciale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`
  );
  const capacita_teorica = await this.getSommaValoriImpiantiInduzione(anno, mese, 31);
  const festivita = await this.getSommaValoriImpiantiInduzione(anno, mese, 20);
  const man_prog = await this.getSommaValoriImpiantiInduzione(anno, mese, 5);
  const man_strao = await this.getSommaValoriImpiantiInduzione(anno, mese, 6);
  const mancanza_materiale = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 21);

  const somma = capacita_teorica - festivita - mancanza_materiale - man_prog - man_strao;

  let val = 0;
  if (capacita_teorica > 0) {
    val = (somma / capacita_teorica).toFixed(3);
  }

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 4);
  log.info(
    `Aggiornato il kpi=4 - (Saturazione Commerciale) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.calculateOEE = async (anno, mese) => {
  log.info(`Calcolo il kpi=15 - (OEE) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese}`);
  const equip_avail = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 3);
  const tasso_qualita = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 29);
  const efficienza_prod = await ImpiantiService.getValoriKpiProduzione(anno, mese, BIConstants.IND.label, 1);

  const val = (parseFloat(tasso_qualita) * parseFloat(efficienza_prod) * parseFloat(equip_avail)).toFixed(3);

  await ImpiantiService.updateKpiProduzione(val, anno, mese, BIConstants.IND.label, 15);
  log.info(
    `Aggiornato il kpi=15 - (OEE) per gli impianti di INDUZIONE per anno=${anno} e mese=${mese} col valore=${val}`
  );
};

module.exports.getSommaValoriImpiantiInduzione = async (anno, mese, fk_kpi) => {
  const sql = `
  SELECT
    SUM(valore) as valore
  FROM
    impianti_crud
  WHERE
    anno = :anno
    AND mese = :mese
    AND fk_impianto IN (18, 19, 20, 21)
    AND fk_kpi = :fk_kpi`;

  const valori = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, mese, fk_kpi },
    type: QueryTypes.SELECT
  });

  if (valori.length === 0) {
    return 0;
  }

  return valori[0].valore;
};

module.exports.getDipendentiCount = async (anno, mese, user) => {
  const date = new Date(anno, mese - 1, 1);
  let dipendentiCount = await getDipendentiTemprasudInduzioneCount(date);
  if (!dipendentiCount) {
    dipendentiCount = await getDipendentiTemprasudInduzioneRaw(date);
    await createDipendentiInduzioneCount(date, dipendentiCount, user);
  }
  return dipendentiCount;
};

const getDipendentiTemprasudInduzioneCount = async (date) => {
  const kpi = await TeamsystemHrDipendentiCount.findOne({
    raw: true,
    where: {
      reparto: 'INDU',
      azienda: '0000000102',
      date
    },
    attributes: ['count_dipendenti']
  });
  return kpi ? kpi.count_dipendenti : null;
};

const getDipendentiTemprasudInduzioneRaw = async () => {
  const kpi = await TeamsystemHrDipendenti.count({
    where: {
      reparto: 'INDU',
      azienda: '0000000102',
      licenziamento: null
    }
  });

  return kpi;
};

const createDipendentiInduzioneCount = async (date, dipendentiCount, user) => {
  await TeamsystemHrDipendentiCount.create({
    date,
    count_dipendenti: dipendentiCount,
    modified_by: user.username,
    modified_date: moment().tz('Europe/Rome'),
    azienda: '0000000102',
    reparto: 'INDU'
  });
};

module.exports.updateDipendentiCount = async (anno, mese, user, dipendenti) => {
  if (dipendenti.dipendentiChangeFlag) {
    const date = new Date(anno, mese - 1, 1);
    await updateDipendentiInduzioneCount(date, dipendenti.value, user);
  }
};

const updateDipendentiInduzioneCount = async (date, dipendentiCount, user) => {
  await TeamsystemHrDipendentiCount.update(
    {
      modified_by: user.username,
      count_dipendenti: dipendentiCount,
      modified_date: moment().tz('Europe/Rome')
    },
    {
      where: {
        date,
        azienda: '0000000102',
        reparto: 'INDU'
      }
    }
  );
};
