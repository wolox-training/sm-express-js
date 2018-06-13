const { users } = require('../models'),
  bcrypt = require('bcryptjs'),
  jwt = require('jwt-simple'),
  config = require('../../config'),
  to = require('../helper/to'),
  { ADMIN, REGULAR } = require('../roles'),
  logger = require('../logger');

const save = async (request, response) => {
  const user = Object.assign(request.body, { role: REGULAR });

  const [error, newUser] = await to(users.create(user));

  if (error) {
    logger.error(error);
    return response.status(400).json(error.original.detail);
  }

  const userData = newUser.dataValues;
  delete userData.password;

  logger.info(`The user ${userData.firstName} has been created`);
  response.status(201).send(userData);
};

const saveOrUpdateAdmin = async (request, response) => {
  const user = Object.assign(request.body, { role: ADMIN });

  const [error, created] = await to(users.upsert(user, { fields: ['role'] }));

  if (error) {
    logger.error(error);
    return response.status(400).json(error.errors.map(element => element.message));
  }

  delete user.password;
  const { status = 200, message = 'updated' } = created ? { status: 201, message: 'created' } : {};

  logger.info(`The user ${user.firstName} has been ${message}`);
  return response.status(status).send(user);
};

const login = (request, response) =>
  users
    .findOne({ where: { email: request.body.email } })
    .then(async user => {
      if (user) {
        const match = await bcrypt.compare(request.body.password, user.password);
        if (match) {
          const userData = user.dataValues;
          delete userData.password;
          response.send({ token: jwt.encode(userData, config.common.session.secret) });
        } else {
          response.status(401).json('The password does not match');
        }
      } else {
        response.status(401).json('The user does not exist');
      }
    })
    .catch(err => {
      logger.error('There was an error accessing the database', err);
      response.status(503).json('There was an error, please try again later');
    });

const findAll = (request, response) =>
  users
    .findAndCountAll()
    .then(data => {
      const limit = config.common.api.pageLimit;
      const requestedPage = request.query.page && request.query.page > 0 ? request.query.page : 1;
      const pages = Math.ceil(data.count / limit);
      const currentPage = Math.min(pages, requestedPage);
      const offset = limit * (currentPage - 1);
      return users
        .findAll({
          attributes: ['id', 'firstName', 'lastName', 'email'],
          limit,
          offset,
          $sort: { id: 1 }
        })
        .then(result => {
          response.json({ result, currentPage, pages });
        });
    })
    .catch(err => {
      logger.error('There was an error accessing the database', err);
      response.status(503).json('There was an error, please try again later');
    });

module.exports = { save, login, findAll, saveOrUpdateAdmin };
