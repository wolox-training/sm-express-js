const validate = require('../helper/validator');

module.exports = validations => (request, response, next) => {
  const errors = validate(request.body, validations);
  if (errors.length) {
    response.status(400).send(errors);
  } else {
    next();
  }
};
