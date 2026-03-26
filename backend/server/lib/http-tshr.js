/* eslint-disable max-len */
const axios = require('axios');
const https = require('https');
const setTimeoutP = require('timers/promises').setTimeout;

const config = require('../config').httpTsHR;

const log = config.log();

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false
});

const getToken = async (times = 0) => {
  try {
    const data = 'grant_type=client_credentials';

    const request = {
      auth: {
        username: process.env.TSHR_USERNAME,
        password: process.env.TSHR_PASSWORD
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(`${process.env.TSHR_URL}/connect/token`, { data }, request);
    return response.data.access_token;
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    times += 1;
    if (times <= 3) {
      // Riprova fino a 3 volte se va in errore la get token, aspetta 5 secondi
      log.error(`There was an error while getting access token from API, let's try again ${error}`, error);
      await setTimeoutP(5000);
      return getToken(times);
    }
    log.error(
      `There was an error while getting access token from API, tried already ${times}. Stopping the job. ${error}`,
      error
    );
    throw error;
  }
};

const getOreMalattiaUnitrat = async (accessToken) => {
  const data = {
    limit: 500,
    offset: 0,
    order: 'ASC',
    filters: [
      {
        field: 'causale',
        operator: 'LIKE',
        value: '%MALA%'
      },
      {
        field: 'azienda',
        operator: 'LIKE',
        value: '%0000000375%'
      }
    ],
    'order-field': 'data'
  };

  const request = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  const response = await axios.post(`${process.env.TSHR_URL}/v1/presenze/tableData?table=risultati`, data, request);

  if (response && response.data.success) {
    return response.data.rows;
  }

  return [];
};

const getOreMalattiaTemprasud = async (accessToken) => {
  const data = {
    limit: 500,
    offset: 0,
    order: 'ASC',
    filters: [
      {
        field: 'causale',
        operator: 'LIKE',
        value: '%MALA%'
      },
      {
        field: 'azienda',
        operator: 'LIKE',
        value: '%0000000102%'
      }
    ],
    'order-field': 'data'
  };

  const request = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  const response = await axios.post(`${process.env.TSHR_URL}/v1/presenze/tableData?table=risultati`, data, request);

  if (response && response.data.success) {
    return response.data.rows;
  }

  return [];
};

const getOre = async (accessToken, causale, azienda, offset, limit, times = 0) => {
  try {
    const data = {
      limit,
      offset,
      order: 'ASC',
      filters: [
        {
          field: 'causale',
          operator: 'LIKE',
          value: `%${causale}%`
        },
        {
          field: 'azienda',
          operator: 'LIKE',
          value: `%${azienda}%`
        }
      ],
      'order-field': 'data'
    };

    const request = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    const response = await axios.post(`${process.env.TSHR_URL}/v1/presenze/tableData?table=risultati`, data, request);

    if (response && response.data.success) {
      return response.data.rows;
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    times += 1;
    if (times <= 3) {
      // Riprova fino a 3 volte se va in errore la get token, aspetta 5 secondi
      log.error(
        `There was an error while getting ore from API /v1/presenze/tableData?table=risultati, let's try again ${error}`,
        error
      );
      await setTimeoutP(5000);
      return getOre(accessToken, causale, azienda, offset, limit, times);
    }
    log.error(
      `There was an error while getting ore from AP /v1/presenze/tableData?table=risultatiI, tried already ${times}. Stopping the job. ${error}`,
      error
    );
    throw error;
  }
};

const getFerieResidue = async (accessToken, azienda, offset, limit, times = 0) => {
  try {
    const data = {
      limit,
      offset,
      order: 'ASC',
      filters: [
        {
          field: 'totale',
          operator: 'LIKE',
          value: 'FERE'
        },
        {
          field: 'azienda',
          operator: 'LIKE',
          value: `${azienda}`
        }
      ],
      'order-field': 'matricola'
    };

    const request = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    const response = await axios.post(
      `${process.env.TSHR_URL}/v1/presenze/tableData?table=dipen_totali`,
      data,
      request
    );

    if (response && response.data.success) {
      return response.data.rows;
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    times += 1;
    if (times <= 3) {
      // Riprova fino a 3 volte se va in errore la get token, aspetta 5 secondi
      log.error(
        `There was an error while getting ore from API /v1/presenze/tableData?table=dipen_totali, let's try again ${error}`,
        error
      );
      await setTimeoutP(5000);
      return getFerieResidue(accessToken, azienda, offset, limit, times);
    }
    log.error(
      `There was an error while getting ore from AP /v1/presenze/tableData?table=dipen_totali, tried already ${times}. Stopping the job. ${error}`,
      error
    );
    throw error;
  }
};

const getDipendenti = async (accessToken, offset, limit, times = 0) => {
  try {
    const data = {
      limit,
      offset,
      order: 'ASC',
      filters: [],
      'order-field': 'matricola'
    };

    const request = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    const response = await axios.post(`${process.env.TSHR_URL}/v1/presenze/tableData?table=dipen`, data, request);

    if (response && response.data.success) {
      return response.data.rows;
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    times += 1;
    if (times <= 3) {
      // Riprova fino a 3 volte se va in errore la get token, aspetta 5 secondi
      log.error(
        `There was an error while getting ore from API /v1/presenze/tableData?table=dipen, let's try again ${error}`,
        error
      );
      await setTimeoutP(5000);
      return getDipendenti(accessToken, offset, limit, times);
    }
    log.error(
      `There was an error while getting ore from AP /v1/presenze/tableData?table=dipen, tried already ${times}. Stopping the job. ${error}`,
      error
    );
    throw error;
  }
};

module.exports.getToken = getToken;
module.exports.getOreMalattiaUnitrat = getOreMalattiaUnitrat;
module.exports.getOreMalattiaTemprasud = getOreMalattiaTemprasud;
module.exports.getOre = getOre;
module.exports.getFerieResidue = getFerieResidue;
module.exports.getDipendenti = getDipendenti;
