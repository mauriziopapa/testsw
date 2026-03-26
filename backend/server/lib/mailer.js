const nodemailer = require('nodemailer');

const trasporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  tls: {
    rejectUnauthorized: false
  }
});

module.exports.sendMail = async (message, subject) => {
  const mailOptions = {
    from: 'etl@studioware.eu',
    to: 'etl@studioware.eu',
    subject
  };
  mailOptions.html = message;
  await trasporter.sendMail(mailOptions);
};
