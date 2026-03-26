/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../../lib/db');
const TargetService = require('./TargetService');
const TempoMesiService = require('./TempoMesiService');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getKpiValues = async (filters) => {
  const results = [];

  const dal = '2022-01-01'; // filters.from;
  const al = '2022-10-28'; // filters.to;

  const tempo = await TempoMesiService.getTempo(dal, al);

  for (let i = 0; i < tempo.length; i++) {
    const row = tempo[i];

    results.push({
      label: row.label,
      val: 123,
      val_prec: 123,
      target: 200
    });
  }

  return results;
};
