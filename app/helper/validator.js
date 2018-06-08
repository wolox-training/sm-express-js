const logger = require('../logger');

const knownEvaluations = {
  required: (value, condition) => (condition ? !!value : true),
  minLength: (value, condition) => typeof value === 'string' && value.length >= condition,
  woloxEmail: (value, condition) => (condition ? /^([a-zA-Z0-9]|\.)+@wolox\.(cl|com\.ar)$/.test(value) : true)
};

const fulfillCondition = (object = {}, key, [evaluation, condition]) => {
  if (evaluation in knownEvaluations) {
    return knownEvaluations[evaluation](object[key], condition);
  }

  logger.warn(`The evaluation '${evaluation}' is not supported. Missing implementation? Typo?`);
  return true;
};

module.exports = (object, validations) => {
  const errors = [];
  Object.keys(validations).forEach(key =>
    Object.entries(validations[key]).forEach(entry => {
      if (!fulfillCondition(object, key, entry)) {
        errors.push(`The attribute ${key} does not fulfill the condition ${entry[0]}:${entry[1]}`);
      }
    })
  );
  return errors;
};
