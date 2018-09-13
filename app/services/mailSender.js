const config = require('../../config').common.email,
  transport = require('nodemailer').createTransport(config),
  { registrationHtml } = require('../helper/htmlMessages'),
  logger = require('../logger');

const sendConfirmationEmail = user =>
  transport.sendMail(
    {
      from: `${config.sender.name} <${config.sender.email}>`,
      to: user.email,
      subject: 'Registration Success',
      html: registrationHtml(user)
    },
    err => {
      if (err) logger.error(err);
    }
  );

module.exports = { sendConfirmationEmail };
