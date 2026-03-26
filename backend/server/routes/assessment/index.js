/* eslint-disable max-len */
/* eslint-disable camelcase */
const express = require('express');
const multer = require('multer');
const moment = require('moment');
const AssessmentService = require('../../services/AssessmentService');
const DashboardServices = require('../../services/DashboardService');
const { isAuthenticated } = require('../../middlewares/authentication');

const config = require('../../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

const router = express.Router();

// Multer File upload settings
const DIR = './snap/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}_${Date.now()}.png`;
    cb(null, fileName);
  }
});

// Multer Mime Type Validation
const upload = multer({
  storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5
  // },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      return cb(null, true);
    }
    cb(null, false);
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

module.exports = () => {
  router.get('/', [isAuthenticated], async (req, res) => {
    try {
      log.info(`User ${req.user.username} is getting assessments list.`);
      const assessments = await AssessmentService.getAssessmentList();
      return res.json(assessments);
    } catch (error) {
      log.error(`Error finding assessments: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.put('/', [isAuthenticated], async (req, res) => {
    try {
      log.info(`User ${req.user.username} is saving assessment.`);
      const assessments = req.body;
      const updated = await AssessmentService.saveAssessment(assessments);
      log.info('Saved assessment successfully.');
      return res.json(updated);
    } catch (error) {
      log.error(`Error updating assessments: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/:anno', [isAuthenticated], async (req, res) => {
    const { anno } = req.params;
    const { trimestre, dashboard, dashboard_instance } = req.query;
    try {
      log.info(
        `User ${req.user.username} is opening assessment for anno=${anno}, trimestre=${trimestre} and dashboard_name=${dashboard} and dashboard_instance=${dashboard_instance}.`
      );
      const dashboards = await DashboardServices.findAllBy({ url: dashboard });
      const assessment = await AssessmentService.getAssessment(
        anno,
        trimestre,
        dashboards[0].iddashboard,
        dashboard_instance
      );
      return res.json(assessment);
    } catch (error) {
      log.error(`Error finding assessment for anno=${req.params}: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.post('/screenshot', [isAuthenticated, upload.single('upload')], async (req, res) => {
    const { anno, fk_widget, trimestre } = req.body;
    try {
      log.info(
        `User ${req.user.username} saved screenshot for fk_widget=${fk_widget}, anno=${anno} and trimestre=${trimestre}.`
      );
      const img_url = req.file.filename;
      const assessment = await AssessmentService.saveScreenshot({ anno, fk_widget, trimestre, img_url });
      log.info('Saved successfully.');
      return res.json(assessment);
    } catch (error) {
      log.error(`Error uploading screenshot: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  router.get('/export/:anno/:trimestre/:dashboard/:dashboard_instance', [isAuthenticated], async (req, res) => {
    const { anno, trimestre, dashboard, dashboard_instance } = req.params;
    log.info(
      `User ${req.user.username} wants to export assessment for dashboard_id=${dashboard}, dashboard_instance=${dashboard_instance}, anno=${anno} and trimestre=${trimestre}.`
    );
    try {
      const docx = await AssessmentService.exportAssessment(anno, trimestre, dashboard, dashboard_instance);

      const time = moment().format('DD-MM-YYYY-HH-mm-ss');

      res.setHeader('Content-Disposition', `attachment; filename=assessment-${time}.docx`);
      res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      log.info('Exported successfully.');
      return res.send(docx);
    } catch (error) {
      log.error(`Error exporting assessment: ${error.message}`, error);
      return res.sendStatus(500);
    }
  });

  return router;
};
