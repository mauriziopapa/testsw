/* eslint-disable max-len */
const axios = require('axios');
const https = require('https');
const setTimeoutP = require('timers/promises').setTimeout;

const config = require('../config').jobZoho;

const log = config.log();

const PAGE = 200;

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false
});

const getToken = async (times = 0) => {
  try {
    const url = `${process.env.ZP_AUTH_ENDPOINT}?scope=${process.env.ZP_SCOPES}&refresh_token=${process.env.ZP_REFRESH_TOKEN}&client_id=${process.env.ZP_CLIENT_ID}&client_secret=${process.env.ZP_CLIENT_SECRET}&grant_type=refresh_token`;
    const response = await axios.post(url);
    return response.data.access_token;
  } catch (error) {
    // eslint-disable-next-line no-param-reassign
    times += 1;
    if (times <= 3) {
      // Riprova fino a 3 volte se va in errore la get token, aspetta 5 secondi
      log.error(`There was an error while getting access token from API, let's try again ${error}`);
      await setTimeoutP(5000);
      return getToken(times);
    }
    log.error(
      `There was an error while getting access token from API, tried already ${times}. Stopping the job. ${error}`
    );
    throw error;
  }
};

const getProjects = async (accessToken, record = 1) => {
  const request = {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    }
  };

  const response = await axios.get(`${process.env.ZP_API_ENDPOINT}/projects/?range=${PAGE}&index=${record}`, request);

  if (response && response.status === 200) {
    return response.data.projects;
  }

  return [];
};

const getProjectTasks = async (accessToken, projectId, record = 1) => {
  // delay 2.5 secondi per evitare il limit della API di ZOHO
  await setTimeoutP(2500);
  const request = {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    }
  };
  const url = `${process.env.ZP_API_ENDPOINT}/projects/${projectId}/tasks/?range=${PAGE}&index=${record}`;
  const response = await axios.get(url, request);

  if (response && response.status === 200) {
    return response.data.tasks;
  }

  return [];
};

const getTaskSubtasks = async (accessToken, projectId, taskId, record = 1) => {
  // delay 2.5 secondi per evitare il limit della API di ZOHO
  await setTimeoutP(2500);
  const request = {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    }
  };
  const url = `${process.env.ZP_API_ENDPOINT}/projects/${projectId}/tasks/${taskId}/subtasks/?range=${PAGE}&index=${record}`;
  const response = await axios.get(url, request);

  if (response && response.status === 200) {
    return response.data.tasks;
  }

  return [];
};

module.exports.getToken = getToken;
module.exports.getProjects = getProjects;
module.exports.getProjectTasks = getProjectTasks;
module.exports.getTaskSubtasks = getTaskSubtasks;
