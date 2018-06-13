const { jwtDecode, to } = require('../helper'),
  config = require('../../config').common.session,
  { users } = require('../models'),
  { ADMIN } = require('../roles'),
  logger = require('../logger');

const loggedIn = async (request, response, next) => {
  const token = request.headers[config.header_name];
  if (!token) return response.status(401).json('Missing authorization token');

  const [error, decodedUser] = await to(jwtDecode(token, config.secret));
  if (error || !decodedUser.id || !decodedUser.email)
    return response.status(401).json('Invalid authorization token');

  return users
    .findOne({ where: { id: decodedUser.id, email: decodedUser.email } })
    .then(user => {
      if (!user) {
        logger.info(
          `The token user with id: ${decodedUser.id} and email: ${decodedUser.email} does not exists`
        );
        return response.status(401).json('Invalid authorization token data');
      }

      response.locals.loggedUser = user;
      next();
    })
    .catch(err => {
      logger.error('There was an error accessing the database', err);
      response.status(503).json('There was an error, please try again later');
    });
};

const isAdmin = (request, response, next) => {
  if (response.locals.loggedUser.role !== ADMIN)
    return response.status(403).json('You do not have permission to access this resource');
  next();
};

module.exports = { loggedIn, isAdmin };
