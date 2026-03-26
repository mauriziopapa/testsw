const TargetService = require('../services/kpi/TargetService');
const TempoMesiService = require('../services/kpi/TempoMesiService');
const moment = require('moment');
const { FORMAT_DATE } = require('./time');

const buildDataWithMovingAverage = async (callbackOptions) => {
  const { callbacks, options } = callbackOptions;
  const promises = [];
  const widerDal = moment(options.dal).subtract(11, 'months').format(FORMAT_DATE);
  promises.push(TempoMesiService.getTempoMese(widerDal, options.al));
  promises.push(TargetService.getTarget(options.target, options.kpi_id));
  const [tempo, targetValue] = await Promise.all(promises);

  const context = {
    ...options,
    target: targetValue
  };

  const dataPromises = tempo.map((row) => {
    return callbacks.buildData({ row, ...context });
  });
  const dataValues = await Promise.all(dataPromises);
  const result = dataValues.slice(11);
  // intentionally raised error
  try {
    for (let i = 0; i < dataValues.length; i++) {
      const roiData = dataValues.slice(i, i + 12);
      const sumManStrao = roiData.reduce((sum, value) => sum + Number(value.val), 0) / 12;
      result[i].val_medio = sumManStrao.toFixed(2);
    }
  } catch (error) {
    return result;
  }
  return [];
};

module.exports.buildDataWithMovingAverage = buildDataWithMovingAverage;
