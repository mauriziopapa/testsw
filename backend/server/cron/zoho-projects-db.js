/* eslint-disable no-await-in-loop */
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const config = require('../config').jobZoho;

const { dbBi } = require('../lib/db');
const { FORMAT_DATE } = require('../lib/time');

const log = config.log();

module.exports.updateTasks = async (tasks, progetto) => {
  log.info(`Updating table zp_task with ${tasks.length} tags.`);

  const promises = tasks.map((task) => saveTask(task, progetto));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

module.exports.updateTags = async (tasks, progetto) => {
  log.info(`Updating table zp_task_tags with ${tasks.lenth} tasks.`);
  const promises = tasks.map((task) => saveTag(task, progetto));
  const out = await Promise.all(promises);
  log.info(`Table updated ${out.length} rows affected.`);
};

module.exports.trucateTaskTable = async () => {
  log.info('Truncating table zp_task.');
  await trucateTaskTable();
  log.info('Table truncated.');
};

const saveTask = async (task, progetto) => {
  try {
    const sql = `
    INSERT INTO zp_task 
     (p_id,
      p_group_name,
      p_group_id,
      p_name,
      p_status,
      end_date,
      id,
      start_date,
      completed,
      completed_time,
      name,
      status_name,
      status_id,
      owners_name,
      owners_id,
      key_name,
      synced)
    VALUES
      (:p_id,
      :p_group_name,
      :p_group_id,
      :p_name,
      :p_status,
      :end_date,
      :id,
      :start_date,
      :completed,
      :completed_time,
      :name,
      :status_name,
      :status_id,
      :owners_name,
      :owners_id,
      :key_name,
      :synced)
    ON DUPLICATE KEY
    UPDATE
      p_group_name = :p_group_name,
      p_group_id = :p_group_id,
      p_name = :p_name,
      p_status = :p_status,
      end_date = :end_date,
      p_id = :p_id,
      start_date = :start_date,
      completed = :completed,
      completed_time = :completed_time,
      name = :name,
      status_name = :status_name,
      status_id = :status_id,
      owners_name = :owners_name,
      owners_id = :owners_id,
      key_name = :key_name,
      synced = :synced`;

    const statusName = task.status.name;
    const statusId = task.status.id;
    const synced = 1;
    let ownerName = 'Non Assegnato';
    let ownerId = null;

    if (task.details.owners.length > 0) {
      ownerName = `${task.details.owners[0].first_name} ${task.details.owners[0].last_name}`;
      ownerId = task.details.owners[0].id ? task.details.owners[0].id : null;
    }

    await dbBi.sequelizeBi.query(sql, {
      replacements: {
        p_id: progetto.idProgetto,
        p_group_name: progetto.groupNameProgetto,
        p_group_id: progetto.groupIdProgetto,
        p_name: progetto.nameProgetto,
        p_status: progetto.statusProgetto,
        end_date: task.end_date ? moment(task.end_date).format(FORMAT_DATE) : null,
        start_date: task.start_date ? moment(task.start_date).format(FORMAT_DATE) : null,
        id: task.id_string,
        completed: task.completed,
        completed_time: task.completed ? moment(task.completed_time).format(FORMAT_DATE) : null,
        name: task.name ? task.name.substring(0, 254) : 0,
        key_name: task.key,
        status_name: statusName,
        status_id: statusId,
        owners_name: ownerName,
        owners_id: ownerId,
        synced
      },
      type: QueryTypes.UPSERT
    });

    if (task.details.owners.length > 1) {
      for (let i = 1; i < task.details.owners.length; i += 1) {
        const owner = task.details.owners[i];
        ownerName = `${owner.first_name} ${owner.last_name}`;
        if (ownerName === 'undefined undefined') {
          ownerName = owner.name;
        }
        ownerId = owner.id;
        await dbBi.sequelizeBi.query(sql, {
          replacements: {
            p_id: progetto.idProgetto,
            p_group_name: progetto.groupNameProgetto,
            p_group_id: progetto.groupIdProgetto,
            p_name: progetto.nameProgetto,
            p_status: progetto.statusProgetto,
            end_date: task.end_date ? moment(task.end_date).format(FORMAT_DATE) : null,
            start_date: task.start_date ? moment(task.start_date).format(FORMAT_DATE) : null,
            id: task.id_string,
            completed: task.completed,
            completed_time: task.completed ? moment(task.completed_time).format(FORMAT_DATE) : null,
            name: task.name ? task.name.substring(0, 254) : 0,
            key_name: task.key,
            status_name: statusName,
            status_id: statusId,
            owners_name: ownerName,
            owners_id: ownerId,
            synced
          },
          type: QueryTypes.UPSERT
        });
      }
    }
  } catch (error) {
    log.error('Errore', error, task);
  }
  return [];
};

const saveTag = async (task, progetto) => {
  try {
    for (let i = 0; i < task.tags.length; i += 1) {
      const tag = task.tags[i];

      const statusName = task.status.name;
      const synced = 1;

      const sql = `
      INSERT INTO zp_task_tags 
        (task_id,
        end_date,
        start_date,
        completed,
        tag_name,
        tag_id,
        completed_time,
        status_name,
        p_name,
        synced)
      VALUES
        (:task_id,
        :end_date,
        :start_date,
        :completed,
        :tag_name,
        :tag_id,
        :completed_time,
        :status_name,
        :p_name,
        :synced)
      ON DUPLICATE KEY
      UPDATE
        end_date = :end_date,
        start_date = :start_date,
        completed = :completed,
        tag_name = :tag_name,
        completed_time = :completed_time,
        status_name = :status_name,
        p_name = :p_name,
        synced = :synced`;

      await dbBi.sequelizeBi.query(sql, {
        replacements: {
          task_id: task.id_string,
          end_date: task.end_date ? moment(task.end_date).format(FORMAT_DATE) : null,
          start_date: task.start_date ? moment(task.start_date).format(FORMAT_DATE) : null,
          completed: task.completed,
          tag_name: tag.name,
          tag_id: tag.id,
          completed_time: task.completed ? moment(task.completed_time).format(FORMAT_DATE) : null,
          status_name: statusName,
          p_name: progetto.nameProgetto,
          synced
        },
        type: QueryTypes.INSERT
      });
    }
  } catch (error) {
    log.error('Errore', error, task);
  }
  return [];
};

const trucateTaskTable = async () => {
  try {
    const sql = 'TRUNCATE TABLE jdcvjmnj_temprasud_bi.zp_task;';
    await dbBi.sequelizeBi.query(sql);
  } catch (error) {
    log.error('Error truncating table zp_task', error);
  }
  return [];
};
