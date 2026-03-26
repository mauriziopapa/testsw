/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const sizeOf = require('image-size');
const { QueryTypes } = require('sequelize');
const { dbBi } = require('../lib/db');
const { db } = require('../lib/db');

const htmlCreator = require('../lib/html-creator');
const docCreator = require('../lib/doc-creator');

const { calculateAspectRatioFit } = require('../lib/image-shrinker');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports.getAssessmentList = async () => {
  const sql = `
  SELECT
    DISTINCT CONCAT(trimestre, ' ', anno) AS ass,
    anno,
    trimestre
  FROM
    tempo_mesi
  WHERE
    anno >= 2023
    AND anno <= YEAR(NOW())
  ORDER BY
    mese_num, anno`;

  const assessments = await dbBi.sequelizeBi.query(sql, {
    type: QueryTypes.SELECT
  });

  return assessments;
};

module.exports.getAssessment = async (anno, trimestre, dashboard, user_dashboard_instance) => {
  const sql = `
  SELECT
    assessment_widget.*
  FROM
    assessment_widget, widget_instance wi 
  WHERE
    anno = :anno
    AND trimestre = :trimestre
    AND fk_dashboard = :dashboard
    AND fk_widget = wi.idwidget 
    AND wi.user_dashboard = :user_dashboard_instance
    AND wi.visible = 1
  ORDER BY wi.\`position\` ASC`;

  const assessment = await db.sequelize.query(sql, {
    replacements: { anno, trimestre, dashboard, user_dashboard_instance },
    type: QueryTypes.SELECT
  });

  return assessment;
};

module.exports.saveAssessment = async (assessments) => {
  const promises = assessments.map((assessment) => updateAssessment(assessment));
  const result = await Promise.all(promises);
  return result;
};

module.exports.saveScreenshot = async (formData) => {
  const img_url = `/snap/${formData.img_url}`;
  const sql = `
  INSERT INTO assessment_widget
    (fk_widget,
    anno,
    trimestre,
    img)
  VALUES
    (:fk_widget,
     :anno,
     :trimestre,
     :img_url)
  ON DUPLICATE KEY
  UPDATE img = :img_url`;

  await db.sequelize.query(sql, {
    replacements: {
      fk_widget: formData.fk_widget,
      anno: formData.anno,
      trimestre: formData.trimestre,
      img_url
    },
    type: QueryTypes.INSERT
  });

  return { msg: 'Screenshot salvato.' };
};

module.exports.exportAssessment = async (anno, trimestre, dashboard, dashboard_instance) => {
  const sql = `
  SELECT assessment_widget.*, dashboard.name AS nome_dashboard, widget.name 
  FROM assessment_widget
    INNER JOIN widget_instance ON widget_instance.idwidget = assessment_widget.fk_widget
    INNER JOIN widget ON widget_instance.idwidget  = widget.id
    INNER JOIN user_dashboard  ON user_dashboard.iduser_dashboard  = widget_instance.user_dashboard 
    INNER JOIN dashboard ON dashboard.iddashboard = user_dashboard.iddashboard
  WHERE widget_instance.user_dashboard = :dashboard_instance 
    AND assessment_widget.trimestre = :trimestre 
    AND assessment_widget.anno = :anno  
    AND assessment_widget.fk_dashboard = :dashboard
    AND assessment_widget.esporta = 1
  ORDER BY widget_instance.\`position\` ASC`;

  const assessment = await db.sequelize.query(sql, {
    replacements: { dashboard, dashboard_instance, anno, trimestre },
    type: QueryTypes.SELECT
  });

  const out = await createAssessmentDoc(assessment);
  return out;
};

async function createAssessmentDoc(assessment) {
  const url = path.resolve(__dirname, '../templates/assessment/template.html');
  const cssUrl = path.resolve(__dirname, '../templates/assessment/style.css');

  let templateHtml = fs.readFileSync(url, 'utf8');
  const css = fs.readFileSync(cssUrl, 'utf8');

  templateHtml = templateHtml.replaceAll('$style', `<style> ${css} </style>`);

  const image = fs.readFileSync(path.resolve(__dirname, '../templates/assessment/img/header_doc.jpg'));
  const headerLogo = image.toString('base64');

  const dataDocumento = moment().format('DD/MM/YYYY');

  assessment.forEach((element) => {
    let imgPath = '';
    try {
      imgPath = fs.readFileSync(path.resolve(__dirname, `../../${element.img}`));
      const dimensions = sizeOf(imgPath);
      const ratio = calculateAspectRatioFit(dimensions.width, dimensions.height, 450, 390);
      element.img_height = ratio.height;
      element.img_width = ratio.width;
    } catch (error) {
      log.error(`Cannot find image at ${path.resolve(__dirname, `../../${element.img}`)}`);
    }
    element.img64 = imgPath.toString('base64');
  });

  const document = {
    html: templateHtml,
    data: {
      headerLogo,
      assessment,
      dataDocumento
    }
  };

  const options = {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 720,
      right: 720,
      bottom: 720,
      left: 720,
      header: 360,
      footer: 360
    }
  };

  let estimateHtml = await htmlCreator.create(document);
  const out = await docCreator.create(estimateHtml, options);
  // free memory
  estimateHtml = '';
  return out;
}

async function updateAssessment(assessment) {
  const sql = `
  INSERT INTO assessment_widget
  (fk_widget,
    anno,
    trimestre,
    fk_dashboard,
    nota_risultati,
    nota_strategia_futura,
    img,
    esporta)
  VALUES
    (:fk_widget,
    :anno,
    :trimestre,
    :fk_dashboard,
    :nota_risultati,
    :nota_strategia_futura,
    :img,
    :esporta)
  ON DUPLICATE KEY
  UPDATE 
   fk_widget=:fk_widget, 
   anno=:anno, 
   trimestre=:trimestre, 
   fk_dashboard=:fk_dashboard, 
   nota_risultati=:nota_risultati, 
   nota_strategia_futura=:nota_strategia_futura,
   esporta=:esporta;
`;

  const result = await db.sequelize.query(sql, {
    replacements: { ...assessment },
    type: QueryTypes.UPDATE
  });

  return result;
}
