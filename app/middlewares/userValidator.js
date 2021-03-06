const baseValidator = require('./baseValidator'),
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

module.exports = baseValidator(validations);
