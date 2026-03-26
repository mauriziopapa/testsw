/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const { ORE_CARTELLINO_IND, ORE_FUNZIONAMENTO_EFFETTIVO_IND } = require('../../models/bi/KPIConstants');
const BIConstants = require('../../models/bi/BIConstants');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);

  // Recupera il tempo e il target
  let promises = [];
  promises.push(TempoMesiService.getTempo(dal, al));
  const [tempo] = await Promise.all(promises);

  // Costruisce i dati KPI iniziali
  promises = tempo.map((t) => buildData(t));
  const results = await Promise.all(promises);

  return results;
};

module.exports.getKpiPIEValues = async (tempo) => {
  const results = [];

  const promises = tempo.map((t) => buildDataPIE(t));
  const dataValues = await Promise.all(promises);
  dataValues.map((d) => results.push(d));

  return results;
};

async function buildData(tempo) {
  const kpi = await getKpi(tempo);
  const value = new Value.Builder().setLabel('').setData(kpi.valori).build();
  const valueGroup = new ValueGroup.Builder().setLabel(tempo.label).setValori(value).build();
  return valueGroup;
}

async function buildDataPIE(tempo) {
  return getKpi(tempo);
}

async function getKpi(tempo) {
  const ore_cartellino = await getOreCartellino(tempo);
  const ore_funzionamento_effettivo = await getOreFunzionamentoEffettivo(tempo);

  const where_ore_cartellino = tempo.anno >= 2023 ? '' : 'AND r.OreCartellino > 0';
  const query_kpi = `
  SELECT
    IFNULL(SUM(IFNULL(r.TempoMessaAPunto, 0)), 0)           AS TempoMessaAPunto,
    IFNULL(SUM(IFNULL(r.TempoCostruzioneInduttore, 0)), 0)  AS TempoCostruzioneInduttore,
    IFNULL(SUM(IFNULL(r.TempoRitardoLaboratorio, 0)), 0)    AS TempoRitardoLaboratorio,
    IFNULL(SUM(IFNULL(r.TempoAssenzaEnergia, 0)), 0)        AS TempoAssenzaEnergia,
    IFNULL(SUM(IFNULL(r.TempoManutenzioneOrdinaria, 0)), 0) AS TempoManutenzioneOrdinaria,
    IFNULL(SUM(IFNULL(r.TempoPulizia, 0)), 0)               AS TempoPulizia,
    IFNULL(SUM(IFNULL(r.TempoGuasto, 0)), 0)                AS TempoGuasto,
    IFNULL(SUM(IFNULL(r.TempoUfficio, 0)), 0)               AS TempoUfficio,
    IFNULL(SUM(IFNULL(r.TempoProtezioni, 0)), 0)            AS TempoProtezioni,
    IFNULL(SUM(IFNULL(r.TempoControlliCricche, 0)), 0)      AS TempoControlliCricche,
    IFNULL(SUM(IFNULL(r.TempoAltreAttivita, 0)), 0)         AS TempoAltreAttivita,
    IFNULL(SUM(IFNULL(r.TempoFormazione, 0)), 0)            AS TempoFormazione
  FROM tempo_mesi tm
  LEFT JOIN riepilogo_induzione r ON tm.anno = r.anno AND tm.mese_num = r.mese
  WHERE tm.anno = :anno AND tm.trimestre = :trimestre ${where_ore_cartellino}
  GROUP BY tm.trimestre`;

  const kpi = await dbBi.sequelizeBi.query(query_kpi, {
    replacements: { anno: tempo.anno, trimestre: tempo.trimestre },
    type: QueryTypes.SELECT
  });

  const denominatore = ore_cartellino - ore_funzionamento_effettivo;

  let altrePerdite = 0;
  const tempoMessaAPunto_perc = (kpi[0].TempoMessaAPunto / denominatore) * 100;
  const tempoCostruzioneInduttore_perc = (kpi[0].TempoCostruzioneInduttore / denominatore) * 100;
  const tempoRitardoLaboratorio_perc = (kpi[0].TempoRitardoLaboratorio / denominatore) * 100;
  const tempoAssenzaEnergia_perc = (kpi[0].TempoAssenzaEnergia / denominatore) * 100;
  const tempoManutenzioneOrdinaria_perc = (kpi[0].TempoManutenzioneOrdinaria / denominatore) * 100;
  const tempoPulizia_perc = (kpi[0].TempoPulizia / denominatore) * 100;
  const tempoGuasto_perc = (kpi[0].TempoGuasto / denominatore) * 100;
  const tempoUfficio_perc = (kpi[0].TempoUfficio / denominatore) * 100;
  const tempoProtezioni_perc = (kpi[0].TempoProtezioni / denominatore) * 100;
  const tempoControlliCricche_perc = (kpi[0].TempoControlliCricche / denominatore) * 100;
  const tempoAltreAttivita_perc = (kpi[0].TempoAltreAttivita / denominatore) * 100;
  const tempoFormazione_perc = (kpi[0].TempoFormazione / denominatore) * 100;
  altrePerdite =
    100 -
    (tempoMessaAPunto_perc +
      tempoCostruzioneInduttore_perc +
      tempoRitardoLaboratorio_perc +
      tempoAssenzaEnergia_perc +
      tempoManutenzioneOrdinaria_perc +
      tempoPulizia_perc +
      tempoGuasto_perc +
      tempoUfficio_perc +
      tempoProtezioni_perc +
      tempoControlliCricche_perc +
      tempoAltreAttivita_perc +
      tempoFormazione_perc);

  if (tempo.anno === new Date().getFullYear()) {
    log.info(
      `denominatore[${denominatore}] = 
        ore_cartellino[${ore_cartellino}] - 
        ore_funzionamento_effettivo[${ore_funzionamento_effettivo}]`
    );

    log.info(`tempoMessaAPunto_perc[${tempoMessaAPunto_perc}] = (${kpi[0].TempoMessaAPunto} / ${denominatore}) * 100`);
    log.info(
      `tempoCostruzioneInduttore_perc[${tempoCostruzioneInduttore_perc}] = (${kpi[0].TempoCostruzioneInduttore} / ${denominatore}) * 100`
    );
    log.info(
      `tempoRitardoLaboratorio_perc[${tempoRitardoLaboratorio_perc}] = (${kpi[0].TempoRitardoLaboratorio} / ${denominatore}) * 100`
    );
    log.info(
      `tempoAssenzaEnergia_perc[${tempoAssenzaEnergia_perc}] = (${kpi[0].TempoAssenzaEnergia} / ${denominatore}) * 100`
    );
    log.info(
      `tempoManutenzioneOrdinaria_perc[${tempoManutenzioneOrdinaria_perc}] = (${kpi[0].TempoManutenzioneOrdinaria} / ${denominatore}) * 100`
    );
    log.info(`tempoPulizia_perc[${tempoPulizia_perc}] = (${kpi[0].TempoPulizia} / ${denominatore}) * 100`);
    log.info(`tempoGuasto_perc[${tempoGuasto_perc}] = (${kpi[0].TempoGuasto} / ${denominatore}) * 100`);
    log.info(`tempoUfficio_perc[${tempoUfficio_perc}] = (${kpi[0].TempoUfficio} / ${denominatore}) * 100`);
    log.info(`tempoProtezioni_perc[${tempoProtezioni_perc}] = (${kpi[0].TempoProtezioni} / ${denominatore}) * 100`);
    log.info(
      `tempoControlliCricche_perc[${tempoControlliCricche_perc}] = (${kpi[0].TempoControlliCricche} / ${denominatore}) * 100`
    );
    log.info(
      `tempoAltreAttivita_perc[${tempoAltreAttivita_perc}] = (${kpi[0].TempoAltreAttivita} / ${denominatore}) * 100`
    );
    log.info(`tempoFormazione_perc[${tempoFormazione_perc}] = (${kpi[0].TempoFormazione} / ${denominatore}) * 100`);

    log.info(`altrePerdite[${altrePerdite}] =
    100 - (tempoMessaAPunto_perc[${tempoMessaAPunto_perc}] + tempoCostruzioneInduttore_perc[${tempoCostruzioneInduttore_perc}] +
      tempoRitardoLaboratorio_perc[${tempoRitardoLaboratorio_perc}] + tempoAssenzaEnergia_perc[${tempoAssenzaEnergia_perc}] +
      tempoManutenzioneOrdinaria_perc[${tempoManutenzioneOrdinaria_perc}] + tempoPulizia_perc[${tempoPulizia_perc}] +
      tempoGuasto_perc[${tempoGuasto_perc}] + tempoUfficio_perc[${tempoUfficio_perc}] + tempoProtezioni_perc[${tempoProtezioni_perc}] +
      tempoControlliCricche_perc[${tempoControlliCricche_perc}] + tempoAltreAttivita_perc[${tempoAltreAttivita_perc}] + 
      tempoFormazione_perc[${tempoFormazione_perc}]);`);
  }

  const values = [];
  values.push(new Value.Builder().setLabel('Tempi Messa a punto').setData(tempoMessaAPunto_perc.toFixed(2)).build());

  values.push(
    new Value.Builder().setLabel('Costruzione induttore').setData(tempoCostruzioneInduttore_perc.toFixed(2)).build()
  );

  values.push(
    new Value.Builder().setLabel('Ritardo laboratorio').setData(tempoRitardoLaboratorio_perc.toFixed(2)).build()
  );

  values.push(new Value.Builder().setLabel('Assenza energia').setData(tempoAssenzaEnergia_perc.toFixed(2)).build());

  values.push(
    new Value.Builder().setLabel('Manutenzione ordinaria').setData(tempoManutenzioneOrdinaria_perc.toFixed(2)).build()
  );

  values.push(new Value.Builder().setLabel('Tempi pulizia').setData(tempoPulizia_perc.toFixed(2)).build());
  values.push(new Value.Builder().setLabel('Guasto').setData(tempoGuasto_perc.toFixed(2)).build());
  values.push(new Value.Builder().setLabel('Tempo Protezioni').setData(tempoProtezioni_perc.toFixed(2)).build());

  values.push(
    new Value.Builder().setLabel('Tempo Controlli Cricche').setData(tempoControlliCricche_perc.toFixed(2)).build()
  );
  values.push(new Value.Builder().setLabel('Tempo Formazione').setData(tempoFormazione_perc.toFixed(2)).build());
  values.push(new Value.Builder().setLabel('Altre attività').setData(tempoAltreAttivita_perc.toFixed(2)).build());

  if (altrePerdite > 0) {
    values.push(new Value.Builder().setLabel('Altre perdite').setData(altrePerdite.toFixed(2)).build());
  }

  return new ValueGroup.Builder().setLabel(tempo.trimestre).setValori(values).build();
}

async function getOreCartellino(tempo) {
  let query = `
  SELECT SUM(IFNULL(kp.OreCartellino, 0)) as somma
  FROM tempo_mesi tm
  LEFT JOIN riepilogo_induzione kp ON tm.anno = kp.anno AND tm.mese_num = kp.mese
  WHERE tm.anno = :anno AND tm.trimestre = :trimestre
  GROUP BY tm.trimestre`;

  if (tempo.anno >= 2023) {
    query = `SELECT
      SUM(val) as somma
    FROM tempo_mesi tm
    LEFT JOIN kpi_produzione kp ON tm.anno = kp.anno AND tm.mese_num = kp.mese
    WHERE kp.kpi = :ORE_CARTELLINO_IND AND kp.reparto = :reparto
    AND tm.anno = :anno AND tm.trimestre = :trimestre
    GROUP BY tm.trimestre`;
  }

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: { ORE_CARTELLINO_IND, anno: tempo.anno, trimestre: tempo.trimestre, reparto: BIConstants.IND.label },
    type: QueryTypes.SELECT
  });
  return kpi[0].somma ? kpi[0].somma : 0;
}

async function getOreFunzionamentoEffettivo(tempo) {
  const query = `
  SELECT
    SUM(val) as somma
  FROM tempo_mesi tm
  LEFT JOIN kpi_produzione kp ON tm.anno = kp.anno AND tm.mese_num = kp.mese
  WHERE kp.kpi = :ORE_FUNZIONAMENTO_EFFETTIVO_IND AND kp.reparto = :reparto
  AND tm.anno = :anno AND tm.trimestre = :trimestre
  GROUP BY tm.trimestre`;

  if (tempo.anno < 2023) {
    return 0;
  }

  const kpi = await dbBi.sequelizeBi.query(query, {
    replacements: {
      ORE_FUNZIONAMENTO_EFFETTIVO_IND,
      anno: tempo.anno,
      trimestre: tempo.trimestre,
      reparto: BIConstants.IND.label
    },
    type: QueryTypes.SELECT
  });
  return kpi[0].somma ? kpi[0].somma : 0;
}
