/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');

const ConcorrenteAnag = require('../../models/bi/ConcorrenteAnag');
const Value = require('../../models/response/Value');
const ValueGroup = require('../../models/response/ValueGroup');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const COSTI_MP = {
  label: 'Costi materie prime',
  column: 'costo_materie_prime_perc'
};

const COSTI_MAN = {
  label: 'Costi manodopera',
  column: 'costo_manodopera_perc'
};

const COSTI_TAX = {
  label: 'Costi godimento terzi',
  column: 'tax'
};

const COSTI_SERVIZI = {
  label: 'Costi per servizi',
  column: 'costi_per_servizi_perc'
};

module.exports.getKpiValues = async (filters) => {
  const dal = parseInt(filters.yearFrom);
  const al = parseInt(filters.yearTo);

  const costo = filters.tipologia;

  let promises = [];
  promises.push(getAnni(dal, al));
  promises.push(getConcorrenti());
  const [tempo, concorrenti] = await Promise.all(promises);

  const shortNomeConc = cutConcorrentiName(concorrenti);
  promises = tempo.map((anni) => buildYearData(anni.anno, shortNomeConc, costo));

  const results = await Promise.all(promises);
  return results;
};

const cutConcorrentiName = (concorrenti) =>
  concorrenti.map((c) => {
    const { id } = c;
    const nome_azienda = c.nome_azienda.split('-')[0].trim();
    return { id, nome_azienda };
  });
module.exports.cutConcorrentiName = cutConcorrentiName;

module.exports.convertDataGroupedByConcorrente = (concorrenti, results) =>
  // Converto la struttura dati in base all'azienda
  // per tutti gli anni
  // Serve per mostrare il kpi per azienda con i dati per ogni anno affiancati
  concorrenti.flatMap((conc) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    results
      .map((r) => {
        const value = r.valori.filter((v) => v.label === conc.nome_azienda)[0];
        value.label = r.label;
        return value;
      })
      .map((datiAzienda) => ({ label: conc.nome_azienda, valori: datiAzienda }))
      .reduce(
        (a, b) => {
          a.label = b.label;
          a.valori.push(b.valori);
          return a;
        },
        { label: '', valori: [] }
      )
  );

const getConcorrenti = async () => ConcorrenteAnag.findAll();
module.exports.getConcorrenti = getConcorrenti;

async function getAnni(dal, al) {
  const query = `
  SELECT DISTINCT anno
  FROM concorrenti
  WHERE anno >= :dal AND anno <= :al
  ORDER BY anno ASC`;

  const anni = await dbBi.sequelizeBi.query(query, {
    replacements: { dal, al },
    type: QueryTypes.SELECT
  });
  return anni;
}

async function buildYearData(anno, concorrenti, costo) {
  const promises = concorrenti.map((concorrente) => buildConcorrenteData(anno, concorrente, costo));
  const results = await Promise.all(promises);
  return new ValueGroup.Builder().setLabel(anno).setValori(results).build();
}

async function buildConcorrenteData(anno, concorrente, costo) {
  if (costo === '-tutte-') {
    const costi = getCosto(costo);
    const promis = costi.map((c) => getKpi(anno, concorrente.id, c.column));
    const kpi = await Promise.all(promis);
    const data = kpi.flatMap((k) => k);
    return new Value.Builder().setLabel(concorrente.nome_azienda).setData(data).build();
  }
  const kpi = await getKpi(anno, concorrente.id, costo);
  return new Value.Builder().setLabel(concorrente.nome_azienda).setData(kpi).build();
}

async function getKpi(anno, concorrente, costo) {
  const costoObj = getCosto(costo);

  const sql = `
  SELECT (${costoObj.column} * 100) AS costo, 
          concorrenti_anag.nome_azienda
  FROM concorrenti
        LEFT JOIN concorrenti_anag ON concorrenti.fk_azienda = concorrenti_anag.id
  WHERE anno = :anno AND concorrenti_anag.id = :concorrente`;

  const kpi = await dbBi.sequelizeBi.query(sql, {
    replacements: { anno, concorrente },
    type: QueryTypes.SELECT
  });

  const values = kpi.map((k) => {
    if (k.costo == null || k.costo === 0) {
      return new Value.Builder().setLabel(costoObj.label).setData(0).build();
    }
    return new Value.Builder().setLabel(costoObj.label).setData(k.costo.toFixed(2)).build();
  });

  values.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    return 0;
  });

  return values;
}

function getCosto(costo) {
  switch (costo) {
    case 'costo_materie_prime_perc':
      return COSTI_MP;
    case 'costo_manodopera_perc':
      return COSTI_MAN;
    case 'tax':
      return COSTI_TAX;
    case 'costi_per_servizi_perc':
      return COSTI_SERVIZI;
    default:
      return [COSTI_MP, COSTI_MAN, COSTI_TAX, COSTI_SERVIZI];
  }
}
