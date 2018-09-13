const registrationHtml = data =>
  `<html>
    <body>
      <p>Welcome ${data.firstName},</p>
      <p>Your registration was a success! You can do a lot of stuff, start using it now! :)</p>
    </body>
  </html>`;

module.exports = { registrationHtml };
