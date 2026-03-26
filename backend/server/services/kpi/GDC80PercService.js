/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const { buildDalAl } = require('../../lib/time');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const { dal, al } = buildDalAl(filters.from, filters.to);
  const { tipologia, kpi_id } = filters;

  if (tipologia === 'trimestrale') {
    return buildDataTrimestrale(dal, al, kpi_id);
  }
  return buildDataAnnuale(dal, al, kpi_id);
};

async function buildDataTrimestrale(dal, al, kpi_id) {
  const tempo = await TempoMesiService.getTempo(dal, al);
  const promises = tempo.map((t) => buildValoriTrimestrali(t.trimestre, t.anno, kpi_id));
  const valori = await Promise.all(promises);
  return valori;
}

async function buildDataAnnuale(dal, al, kpi_id) {
  const tempo = await TempoMesiService.getTempoAnnuale(dal, al);
  const promises = tempo.map((t) => buildValoriAnnuali(t.anno, kpi_id));
  const valori = await Promise.all(promises);
  return valori;
}

async function buildValoriTrimestrali(trimestre, anno, kpi_id) {
  const kpi = await getKpiTrimestrale(trimestre, anno);
  const limite = await getLimiteTrimestrale(trimestre, anno);
  return buildCommonStructure(anno, kpi, limite, kpi_id, `${trimestre} - ${anno}`);
}

async function buildValoriAnnuali(anno, kpi_id) {
  const kpi = await getKpiAnnuale(anno);
  const limite = await getLimiteAnnuale(anno);
  return buildCommonStructure(anno, kpi, limite, kpi_id, `${anno}`);
}

async function buildCommonStructure(anno, kpi, limite, kpi_id, label) {
  const data = filterByLimit(kpi, limite);
  const target = await TargetService.getTarget(anno, kpi_id);
  const valori = new Value.Builder().setLabel('GDC').setData(data.length).build();
  return new ValueGroup.Builder().setLabel(label).setValori([valori]).setTarget(target).build();
}

async function getLimiteTrimestrale(trimestre, anno) {
  const query = `
  SELECT SUM(ifnull(Totale_Imponibile, 0)) as fatturato_tot
  FROM fatture_testate
  LEFT JOIN tempo_mesi ON tempo_mesi.mese_num = fatture_testate.mese_num 
    AND tempo_mesi.anno = fatture_testate.AnnoFattura
  WHERE tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { trimestre, anno },
    type: QueryTypes.SELECT
  });

  return result[0].fatturato_tot * 0.8;
}

async function getKpiTrimestrale(trimestre, anno) {
  const query = `
  SELECT SUM(Totale_Imponibile) as somma
  FROM fatture_testate
  LEFT JOIN tempo_mesi ON tempo_mesi.mese_num = fatture_testate.mese_num 
    AND tempo_mesi.anno = fatture_testate.AnnoFattura
  WHERE tempo_mesi.trimestre = :trimestre AND tempo_mesi.anno = :anno
  GROUP BY CodiceCliente
  ORDER BY SUM(Totale_Imponibile) DESC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { trimestre, anno },
    type: QueryTypes.SELECT
  });

  return result;
}

async function getLimiteAnnuale(anno) {
  const query = `
  SELECT SUM(ifnull(Totale_Imponibile, 0)) as fatturato_tot
  FROM fatture_testate
  LEFT JOIN tempo_mesi ON tempo_mesi.mese_num = fatture_testate.mese_num 
    AND tempo_mesi.anno = fatture_testate.AnnoFattura
  WHERE tempo_mesi.anno = :anno`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return result[0].fatturato_tot * 0.8;
}

async function getKpiAnnuale(anno) {
  const query = `
  SELECT SUM(Totale_Imponibile) as somma
  FROM fatture_testate
  LEFT JOIN tempo_mesi ON tempo_mesi.mese_num = fatture_testate.mese_num 
    AND tempo_mesi.anno = fatture_testate.AnnoFattura
  WHERE tempo_mesi.anno = :anno
  GROUP BY CodiceCliente
  ORDER BY SUM(Totale_Imponibile) DESC`;

  const result = await dbBi.sequelizeBi.query(query, {
    replacements: { anno },
    type: QueryTypes.SELECT
  });

  return result;
}

function filterByLimit(array, limit) {
  let somma = 0;
  return array.filter((k) => {
    if (somma > limit) {
      return false;
    }
    somma += k.somma;
    return true;
  });
}
