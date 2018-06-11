const { users } = require('../models'),
  bcrypt = require('bcryptjs'),
  jwt = require('jwt-simple'),
  config = require('../../config'),
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

const login = (request, response) =>
  users
    .findOne({ where: { email: request.body.email } })
    .then(user => {
      if (user) {
        bcrypt.compare(request.body.password, user.password, (err, res) => {
          if (res) {
            delete user.password;
            response.send({ token: jwt.encode(user, config.common.session.secret) });
          } else {
            response.status(401).json('The password does not match');
          }
        });
      } else {
        response.status(401).json('The user does not exist');
      }
    })
    .catch(err => {
      logger.error('There was an error accessing the database', err);
      response.status(503).json('There was an error, please try again later');
    });

module.exports = { save, login };
