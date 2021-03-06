const jwtDecode = require('../helper/jwtDecode'),
  to = require('../helper/to'),
  config = require('../../config').common.session,
  { users, sessions } = require('../models'),
  { ADMIN } = require('../roles'),
  logger = require('../logger');

const loggedIn = async (request, response, next) => {
  const token = request.headers[config.header_name];
  if (!token) return response.status(401).json('Missing authorization token');

  const [error] = await to(jwtDecode(token, config.secret));
  if (error) return response.status(401).json('Invalid authorization token');

  return sessions
    .findOne({ where: { token } })
    .then(session => {
      if (!session) return response.status(401).json('Invalid authorization token');

      return session.getUser().then(user => {
        response.locals.loggedUser = user;
        next();
      });
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

const isAdminOrLoggedUser = (request, response, next) => {
  const loggedUser = response.locals.loggedUser;
  if (parseInt(request.params.id) !== loggedUser.id && loggedUser.role !== ADMIN)
    return response.status(403).json('You do not have permission to access this resource');
  next();
};

const isLoggedUser = (request, response, next) => {
  const loggedUser = response.locals.loggedUser;
  if (parseInt(request.params.id) !== loggedUser.id)
    return response.status(403).json('You do not have permission to access this resource');
  next();
};

module.exports = { loggedIn, isAdmin, isAdminOrLoggedUser, isLoggedUser };
