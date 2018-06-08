const userValidator = require('../services/userValidator');

module.exports = (request, response, next) => {
  if (userValidator(request.body)) {
    next();
  } else {
    response.status(403).send('The information is invalid');
  }
};
