const validations = {
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

const knownEvaluations = {
  required: (value, condition) => (condition ? !!value : true),
  minLength: (value, condition) => typeof value === 'string' && value.length >= condition,
  woloxEmail: (value, condition) => (condition ? /^([a-zA-Z0-9]|\.)+@wolox\.(cl|com\.ar)$/.test(value) : true)
};

const evaluate = (object = {}, key, [evaluation, condition]) =>
  evaluation in knownEvaluations ? knownEvaluations[evaluation](object[key], condition) : false;

module.exports = user =>
  Object.keys(validations).every(key =>
    Object.entries(validations[key]).every(entry => evaluate(user, key, entry))
  );
