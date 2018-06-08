const { users } = require('../models'),
  logger = require('../logger');

const save = (request, response) =>
  users
    .create(request.body)
    .then(newUser => {
      const userData = newUser.dataValues;
      delete userData.password;

      logger.info(`The user ${userData.firstName} has been created`);
      response.status(201).send(userData);
    })
    .catch(error => {
      logger.error(error.original.detail);
      response.status(400).json(error.original.detail);
    });

module.exports = { save };
