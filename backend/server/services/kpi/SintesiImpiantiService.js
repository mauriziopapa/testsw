/* eslint-disable no-param-reassign */
/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');

const BIConstants = require('../../models/bi/BIConstants');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const labels = new Map([
  [0, 'Capacità Teorica'],
  [1, 'Ore Acceso'],
  [2, 'Funzionamento Effettivo'],
  [3, 'Tempo Produttivo']
]);

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const inputTarget = filters.target ? filters.target : new Date().getFullYear();
  const { reparto, kpi_id } = filters;

  const promises = [];
  promises.push(TargetService.getTarget(inputTarget, kpi_id));
  const [target] = await Promise.all(promises);

  let dataValues = [];
  if (!reparto) {
    dataValues = await buildDataInduzione(dal, al);
  } else {
    dataValues = await buildData(dal, al, reparto);
  }
  const results = dataValues.map((d, index) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    new ValueGroup.Builder().setLabel(labels.get(index)).setValori(d).setTarget(target).build()
  );

  return results;
};

async function buildData(dal, al, reparto) {
  const kpiValues = await getKpi(dal, al, reparto);

  try {
    const cap_teorica = kpiValues.find((kpi) => kpi.kpi === 31).val;
    const kpi5 = kpiValues.find((kpi) => kpi.kpi === 5).val;
    const kpi6 = kpiValues.find((kpi) => kpi.kpi === 6).val;
    const kpi7 = kpiValues.find((kpi) => kpi.kpi === 7).val;
    const kpi20 = kpiValues.find((kpi) => kpi.kpi === 20).val;
    const kpi21 = kpiValues.find((kpi) => kpi.kpi === 21).val;
    const kpi22 = kpiValues.find((kpi) => kpi.kpi === 22).val;
    const kpi23 = kpiValues.find((kpi) => kpi.kpi === 23).val;
    const kpi25 = kpiValues.find((kpi) => kpi.kpi === 25).val;
    const kpi26 = kpiValues.find((kpi) => kpi.kpi === 26).val;

    // Prima colonna: Capacità teorica 100%
    const col1 = buildCol(100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    // Seconda colonna
    const spento_guasto = ((kpi6 / cap_teorica) * 100).toFixed(2);
    const spento_man = ((kpi5 / cap_teorica) * 100).toFixed(2);
    const spento_mat = ((kpi21 / cap_teorica) * 100).toFixed(2);
    const festivita = ((kpi20 / cap_teorica) * 100).toFixed(2);
    const cap_pratica = 100 - spento_guasto - spento_man - spento_mat - festivita;
    const col2 = buildCol(
      0,
      cap_pratica.toFixed(2),
      spento_guasto,
      spento_man,
      spento_mat,
      festivita,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );

    // Terza colonna
    const standby_guasti = ((kpi7 / cap_teorica) * 100).toFixed(2);
    const standby_man = ((kpi23 / cap_teorica) * 100).toFixed(2);
    const standby_mat = ((kpi22 / cap_teorica) * 100).toFixed(2);
    const tempo_produttivo =
      100 - spento_guasto - spento_man - spento_mat - festivita - standby_guasti - standby_man - standby_mat;
    const col3 = buildCol(
      0,
      0,
      0,
      0,
      0,
      0,
      tempo_produttivo.toFixed(2),
      standby_guasti,
      standby_man,
      standby_mat,
      0,
      0,
      0
    );

    // Quarta colonna
    const rilavorazioni = ((kpi25 / cap_teorica) * 100).toFixed(2);
    const campionature = ((kpi26 / cap_teorica) * 100).toFixed(2);
    const tempo_utile =
      100 -
      spento_guasto -
      spento_man -
      spento_mat -
      festivita -
      standby_guasti -
      standby_man -
      standby_mat -
      rilavorazioni -
      campionature;
    // const tempo_perso = parseFloat(rilavorazioni) + parseFloat(campionature);
    const col4 = buildCol(
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      tempo_utile.toFixed(2),
      parseFloat(rilavorazioni).toFixed(2),
      parseFloat(campionature).toFixed(2)
    );

    return [col1, col2, col3, col4];
  } catch (error) {
    log.error('Errore in SintesiImpiantiService', error);
    // Prima colonna: Capacità teorica 100%
    const col1 = buildCol(100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col2 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col3 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col4 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    return [col1, col2, col3, col4];
  }
}

async function buildDataInduzione(dal, al) {
  const kpiValues = await getKpiInduzione(dal, al);

  try {
    const cap_teorica = kpiValues.find((kpi) => kpi.kpi === 31).val;
    const kpi5 = kpiValues.find((kpi) => kpi.kpi === 5).val;
    const kpi6 = kpiValues.find((kpi) => kpi.kpi === 6).val;
    const kpi20 = kpiValues.find((kpi) => kpi.kpi === 20).val;
    const kpi25 = kpiValues.find((kpi) => kpi.kpi === 25).val;
    const kpi26 = kpiValues.find((kpi) => kpi.kpi === 26).val;
    const kpi8 = kpiValues.find((kpi) => kpi.kpi === 8).val;
    const kpi14 = kpiValues.find((kpi) => kpi.kpi === 14).val;
    const kpi21 = kpiValues.find((kpi) => kpi.kpi === 21).val;
    const kpi24 = kpiValues.find((kpi) => kpi.kpi === 24).val;
    const kpi27 = kpiValues.find((kpi) => kpi.kpi === 27).val;
    const kpi46 = kpiValues.find((kpi) => kpi.kpi === 46).val;
    const kpi47 = kpiValues.find((kpi) => kpi.kpi === 47).val;
    const kpi48 = kpiValues.find((kpi) => kpi.kpi === 48).val;
    const kpi49 = kpiValues.find((kpi) => kpi.kpi === 49).val;
    const kpi50 = kpiValues.find((kpi) => kpi.kpi === 50).val;
    const kpi51 = kpiValues.find((kpi) => kpi.kpi === 51).val;
    const kpi52 = kpiValues.find((kpi) => kpi.kpi === 52).val;
    const kpi53 = kpiValues.find((kpi) => kpi.kpi === 53).val;
    const kpi54 = kpiValues.find((kpi) => kpi.kpi === 54).val;
    const kpi55 = kpiValues.find((kpi) => kpi.kpi === 55).val;

    // Prima colonna: Capacità teorica 100%
    const col1 = buildColInduzione(100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    // Seconda colonna
    const ore_acceso = ((kpi14 / cap_teorica) * 100).toFixed(2);
    const festivita = ((kpi20 / cap_teorica) * 100).toFixed(2);
    const no_personale = ((kpi8 / cap_teorica) * 100).toFixed(2);
    const no_materiale = ((kpi21 / cap_teorica) * 100).toFixed(2);
    const spento_manutenz = ((kpi5 / cap_teorica) * 100).toFixed(2);
    const spento_guasto = ((kpi6 / cap_teorica) * 100).toFixed(2);
    const campionature = ((kpi26 / cap_teorica) * 100).toFixed(2);
    const totalePerDebug =
      100 - spento_guasto - spento_manutenz - no_materiale - festivita - no_personale - campionature - ore_acceso;
    const col2 = buildColInduzione(
      0,
      ore_acceso,
      spento_guasto,
      spento_manutenz,
      no_materiale,
      festivita,
      0,
      0,
      no_personale,
      0,
      0,
      0,
      campionature,
      0,
      0
    );

    // Terza colonna
    const altre_perdite = (kpi55 / cap_teorica) * 100;
    const perdita46 = (kpi46 / cap_teorica) * 100;
    const perdita47 = (kpi47 / cap_teorica) * 100;
    const perdita48 = (kpi48 / cap_teorica) * 100;
    const perdita49 = (kpi49 / cap_teorica) * 100;
    const perdita50 = (kpi50 / cap_teorica) * 100;
    const perdita51 = (kpi51 / cap_teorica) * 100;
    const perdita52 = (kpi52 / cap_teorica) * 100;
    const perdita53 = (kpi53 / cap_teorica) * 100;
    const perdita54 = (kpi54 / cap_teorica) * 100;
    const perdite =
      perdita46 + perdita47 + perdita48 + perdita49 + perdita50 + perdita51 + perdita52 + perdita53 + perdita54;
    const funz_effettivo = (kpi24 / cap_teorica) * 100;

    const col3 = buildColInduzione(
      0,
      0,
      0,
      0,
      0,
      0,
      funz_effettivo.toFixed(2),
      0,
      0,
      0,
      0,
      0,
      0,
      perdite.toFixed(2),
      altre_perdite.toFixed(2)
    );

    // Quarta colonna
    const ore_produttive = ((kpi27 / cap_teorica) * 100).toFixed(2);
    const rilavorazioni = ((kpi25 / cap_teorica) * 100).toFixed(2);

    const col4 = buildColInduzione(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ore_produttive, rilavorazioni, 0, 0, 0);

    return [col1, col2, col3, col4];
  } catch (error) {
    log.error('Errore in SintesiImpiantiService', error);
    // Prima colonna: Capacità teorica 100%
    const col1 = buildCol(100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col2 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col3 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const col4 = buildCol(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    return [col1, col2, col3, col4];
  }
}

function buildColInduzione(
  cap_teorica,
  ore_acceso,
  spento_guasto,
  spento_man,
  spento_mat,
  festivita,
  funz_effettivo,
  guasti,
  no_personale,
  no_materiale,
  tempo_produttivo,
  rilavorazioni,
  campionature,
  perdite,
  altre_perdite
) {
  return [
    new Value.Builder().setLabel('Capacità Teorica').setData(cap_teorica).build(),
    new Value.Builder().setLabel('Tempo ore acceso').setData(ore_acceso).build(),
    new Value.Builder().setLabel('Ore spento per guasto').setData(spento_guasto).build(),
    new Value.Builder().setLabel('Manutenzione programmata/preventiva').setData(spento_man).build(),
    new Value.Builder().setLabel('Mancanza materiale').setData(spento_mat).build(),
    new Value.Builder().setLabel('Festività').setData(festivita).build(),
    new Value.Builder().setLabel('Tempo Funzionamento Effettivo').setData(funz_effettivo).build(),
    new Value.Builder().setLabel('Guasti').setData(guasti).build(),
    new Value.Builder().setLabel('Mancanza manodopera').setData(no_personale).build(),
    new Value.Builder().setLabel('Mancanza materiale').setData(no_materiale).build(),
    new Value.Builder().setLabel('Tempo Produttivo').setData(tempo_produttivo).build(),
    new Value.Builder().setLabel('Rilavorazioni').setData(rilavorazioni).build(),
    new Value.Builder().setLabel('Campionature').setData(campionature).build(),
    new Value.Builder().setLabel('Perdite').setData(perdite).build(),
    new Value.Builder().setLabel('Altre Perdite').setData(altre_perdite).build()
  ];
}

function buildCol(
  cap_teorica,
  sat_commerciale,
  spento_guasto,
  spento_man,
  spento_mat,
  festivita,
  tempo_produttivo,
  standby_guasti,
  standby_man,
  standby_mat,
  tempo_utile,
  rilavorazioni,
  campionature
) {
  return [
    new Value.Builder().setLabel('Capacità Teorica').setData(cap_teorica).build(),
    new Value.Builder().setLabel('Tempo ore acceso').setData(sat_commerciale).build(),
    new Value.Builder().setLabel('Ore spento per guasto').setData(spento_guasto).build(),
    new Value.Builder().setLabel('Manutenzione programmata/preventiva').setData(spento_man).build(),
    new Value.Builder().setLabel('Mancanza materiale').setData(spento_mat).build(),
    new Value.Builder().setLabel('Festività').setData(festivita).build(),
    new Value.Builder().setLabel('Tempo Funzionamento Effettivo').setData(tempo_produttivo).build(),
    new Value.Builder().setLabel('Guasti').setData(standby_guasti).build(),
    new Value.Builder().setLabel('Mancanza manodopera').setData(standby_man).build(),
    new Value.Builder().setLabel('Mancanza materiale').setData(standby_mat).build(),
    new Value.Builder().setLabel('Tempo Produttivo').setData(tempo_utile).build(),
    new Value.Builder().setLabel('Rilavorazioni').setData(rilavorazioni).build(),
    new Value.Builder().setLabel('Campionature').setData(campionature).build()
  ];
}

async function getKpi(dal, al, reparto) {
  const query = `
  SELECT fk_kpi AS kpi, SUM(IFNULL(valore, 0)) AS val
  FROM impianti_crud
  WHERE 
    date(concat(LAST_DAY(concat(anno,'-',mese,'-01')))) >= date(:dal) 
    AND date(concat(anno, '-',mese, '-01')) <= date(:al)
    AND fk_impianto in (SELECT id FROM impianti_anag ia WHERE gruppo_impianto = :reparto)
    AND fk_kpi in (31, 5, 6, 7, 20, 21, 22, 23, 25, 26 ) 
  GROUP BY fk_kpi`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, reparto },
    type: QueryTypes.SELECT
  });
  return kpi;
}

async function getKpiInduzione(dal, al) {
  const query = `
  SELECT
    fk_kpi AS kpi,
    SUM(IFNULL(valore, 0)) AS val
  FROM
    impianti_crud
  WHERE
    date(concat(LAST_DAY(concat(anno, '-', mese, '-01')))) >= date(:dal) 
    AND date(concat(anno, '-', mese, '-01')) <= date(:al)
    AND fk_impianto in (18, 19, 20, 21)
    AND fk_kpi in (31, 20, 5, 6, 26, 25)
  GROUP BY
    fk_kpi
  UNION ALL 
      SELECT
    kpi AS kpi,
    SUM(IFNULL(val, 0)) AS val
  FROM
    kpi_produzione kp
  WHERE
    date(concat(LAST_DAY(concat(anno, '-', mese, '-01')))) >= date(:dal) 
    AND date(concat(anno, '-', mese, '-01')) <= date(:al)
    AND reparto = :reparto
    AND kpi in (8, 14, 21, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 24, 27)
  GROUP BY
    kpi`;

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  return kpi;
}
