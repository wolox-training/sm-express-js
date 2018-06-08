const validate = require('../helper/validator'),
  validations = {
    firstName: {
      required: true
    },
    lastName: {
      required: true
    },
    email: {
      required: true,
      woloxEmail: true
    },
    password: {
      required: true,
      minLength: 8
    }
  };

module.exports = (request, response, next) => {
  const errors = validate(request.body, validations);
  if (errors.length) {
    response.status(400).send(errors);
  } else {
    next();
  }
};
