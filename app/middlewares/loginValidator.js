const baseValidator = require('./baseValidator'),
  validations = {
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
