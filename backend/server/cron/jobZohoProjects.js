/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
const config = require('../config').jobZoho;
const { sendMail } = require('../lib/mailer');

const log = config.log();

const { getToken, getProjects, getProjectTasks, getTaskSubtasks } = require('../lib/http-zoho');
const { updateTasks, updateTags, trucateTaskTable } = require('./zoho-projects-db');

const jobZohoProjects = async () => {
  const startTime = new Date();
  let idProgetto = '';
  let nameProgetto = '';
  let groupNameProgetto = '';
  let groupIdProgetto = '';
  let statusProgetto = '';
  try {
    let tasks = [];
    const accessToken = await getToken();
    log.info('Obtained access token!');
    const progetti = await getProjects(accessToken);
    for (let i = 0; i < progetti.length; i += 1) {
      const progetto = progetti[i];
      if (progetto.id_string === '1392023000000029283') {
        idProgetto = progetto.id_string;
        nameProgetto = progetto.name;
        groupNameProgetto = progetto.group_name;
        groupIdProgetto = progetto.group_id;
        statusProgetto = progetto.status;
        let responseTasks = [];
        let record = 1;
        do {
          responseTasks = await getProjectTasks(accessToken, progetto.id_string, record);
          tasks = tasks.concat(responseTasks);
          record += 200;
        } while (responseTasks.length > 0);
      }
    }

    let subtasks = [];
    for (let i = 0; i < tasks.length; i += 1) {
      const task = tasks[i];
      const taskSubtasks = await getSubTasks(accessToken, idProgetto, task);
      subtasks = subtasks.concat(taskSubtasks);
    }

    tasks = tasks.concat(subtasks);

    const progetto = {
      idProgetto,
      nameProgetto,
      groupNameProgetto,
      groupIdProgetto,
      statusProgetto
    };
    // Prima pulisco la tabella dei task
    await trucateTaskTable();

    // Aggiorno i kpi personale in base alle ore importate da TS HR
    await updateTasks(tasks, progetto);

    const taskTags = tasks.filter((task) => task.tags != null);
    await updateTags(taskTags, progetto);
  } catch (error) {
    log.error(error);
    const message = `Si è verificato un errore durante l'esecuzione del job zoho projects: ${error.message}`;
    await sendMail(message, '[ERROR] Sapere Temprasud - ZOHO PROJECTS Job');
  }
  const finishTime = new Date();
  const diffTime = difference(startTime, finishTime);
  await sendMail('TUTTO OK', '[OK] Sapere Temprasud - ZOHO PROJECTS Job');
  log.info(`Durata dello script: ${diffTime} - formato HH:mm`);
  // process.exit(0);
};

const getSubTasks = async (accessToken, idProgetto, task) => {
  const record = 1;
  let subtasks = [];
  if (task.subtasks) {
    try {
      let taskSubtasks = await getTaskSubtasks(accessToken, idProgetto, task.id_string, record);
      log.info(`Ci sono ${taskSubtasks.length} subtasks per il task: ${task.id_string}`);
      for (let i = 0; i < taskSubtasks.length; i += 1) {
        const subtask = taskSubtasks[i];
        const sub = await getSubTasks(accessToken, idProgetto, subtask);
        taskSubtasks = taskSubtasks.concat(sub);
      }
      subtasks = subtasks.concat(taskSubtasks);
    } catch (error) {
      log.error(error);
    }
  }

  return subtasks;
};

const difference = (startDate, endDate) => {
  let diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diff / 1000 / 60);

  return `${(hours < 9 ? '0' : '') + hours}:${minutes < 9 ? '0' : ''}${minutes}`;
};

jobZohoProjects();
