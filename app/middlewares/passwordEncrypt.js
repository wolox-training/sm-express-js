const bcrypt = require('bcryptjs'),
  saltRounds = 10;

module.exports = (request, response, next) => {
  bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
    if (err) {
      response.status(503).send('We could not save your data, try again later');
    } else {
      request.body.password = hash;
      next();
    }
  });
};
