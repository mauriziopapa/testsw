/* eslint-disable implicit-arrow-linebreak */
require('dotenv').config({ path: `./server/config/.env.${process.env.NODE_ENV}` });
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, errors, timestamp, json } = winston.format;

const fileRotateTransport = {
  filename: 'error-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const jobFileRotateTransport = {
  filename: 'jobOre-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const httpTSHRFileRotateTransport = {
  filename: 'httpTSHR-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const jobDipendentiFileRotateTransport = {
  filename: 'jobDipendenti-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const jobPerformanceClientiFileRotateTransport = {
  filename: 'jobPerformanceClienti-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '5d'
};

const jobZohoFileRotateTransport = {
  filename: 'jobZoho-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const jobQwinFileRotateTransport = {
  filename: 'jobQwin-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const jobKpiTabelleFileRotateTransport = {
  filename: 'jobKpiTabelle-log-%DATE%.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d'
};

const loggers = {
  local: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(fileRotateTransport)]
    }),
  production: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(fileRotateTransport)]
    }),
  test: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: true }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(fileRotateTransport)]
    }),
  httpTsHR: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(httpTSHRFileRotateTransport)]
    }),
  jobOre: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobFileRotateTransport)]
    }),
  jobDipendenti: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobDipendentiFileRotateTransport)]
    }),
  jobPerformanceClienti: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobPerformanceClientiFileRotateTransport)]
    }),
  jobQWIN: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobQwinFileRotateTransport)]
    }),
  jobZoho: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobZohoFileRotateTransport)]
    }),
  jobKpiTabelle: () =>
    winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(errors({ stack: false }), timestamp(), json()),
      transports: [new winston.transports.DailyRotateFile(jobKpiTabelleFileRotateTransport)]
    })
};

module.exports = {
  local: {
    sitename: 'SAPERE Temprasud [Development]',
    log: loggers.local
  },
  production: {
    sitename: 'SAPERE Temprasud',
    log: loggers.production
  },
  test: {
    sitename: 'SAPERE Temprasud [Test]',
    log: loggers.test
  },
  httpTsHR: {
    sitename: 'SAPERE Temprasud [httpTsHR]',
    log: loggers.httpTsHR
  },
  jobOre: {
    sitename: 'SAPERE Temprasud [jobOre]',
    log: loggers.jobOre
  },
  jobDipendenti: {
    sitename: 'SAPERE Temprasud [jobDipendenti]',
    log: loggers.jobDipendenti
  },
  jobPerformanceClienti: {
    sitename: 'SAPERE Temprasud [jobPerformanceClienti]',
    log: loggers.jobDipendenti
  },
  jobQWIN: {
    sitename: 'SAPERE Temprasud [jobQWIN]',
    log: loggers.jobQWIN
  },
  jobZoho: {
    sitename: 'SAPERE Temprasud [jobZoho]',
    log: loggers.jobZoho
  },
  jobFatture: {
    sitename: 'SAPERE Temprasud [jobFatture]',
    log: loggers.jobZoho
  },
  jobKpiTabelle: {
    sitename: 'SAPERE Temprasud [jobKpiTabelle]',
    log: loggers.jobKpiTabelle
  }
};
