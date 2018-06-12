const jwt = require('jwt-simple'),
  config = require('../../config'),
  { users } = require('../models'),
  logger = require('../logger');

module.exports = (request, response, next) => {
  const token = request.headers[config.common.session.header_name];
  if (token) {
    try {
      const decodedUser = jwt.decode(token, config.common.session.secret);
      if (decodedUser.id && decodedUser.email) {
        return users
          .findOne({ where: { id: decodedUser.id, email: decodedUser.email } })
          .then(user => {
            if (user) {
              next();
            } else {
              logger.info(
                `The token user with id: ${decodedUser.id} and email:${decodedUser.email} does not exists`
              );
              response.status(401).json('Invalid authorization token data');
            }
          })
          .catch(err => {
            logger.error('There was an error accessing the database', err);
            response.status(503).json('There was an error, please try again later');
          });
      } else {
        response.status(401).json('Invalid authorization token');
      }
    } catch (error) {
      logger.debug('Error validating token', error);
      response.status(401).json('Invalid authorization token');
    }
  } else {
    response.status(401).json('Missing authorization token');
  }
};
