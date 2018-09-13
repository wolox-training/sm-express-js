const { users, sessions } = require('../models'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  config = require('../../config'),
  axios = require('axios'),
  to = require('../helper/to'),
  { ADMIN, REGULAR } = require('../roles'),
  { sendConfirmationEmail } = require('../services/mailSender'),
  logger = require('../logger'),
  expiresIn = config.common.session.expireTime,
  photoEndpoint = `${config.common.api.photosEndpointHost}${config.common.api.photosEndpointRoute}`,
  _logDatabaseError = response => err => {
    logger.error('There was an error accessing the database', err);
    response.status(503).json('There was an error, please try again later');
  };

const save = async (request, response) => {
  const user = Object.assign(request.body, { role: REGULAR });

  const [error, newUser] = await to(users.create(user));

  if (error) {
    logger.error(error);
    return response.status(400).json(error.original.detail);
  }

  const userData = newUser.dataValues;
  delete userData.password;
  sendConfirmationEmail(userData);

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
      if (!user) return response.status(401).json('The user does not exist');

      const match = await bcrypt.compare(request.body.password, user.password);
      if (!match) return response.status(401).json('The password does not match');

      const userData = user.dataValues;
      delete userData.password;
      const token = {
        token: jwt.sign(userData, config.common.session.secret, { expiresIn }),
        expiresIn
      };
      await sessions.create(Object.assign({}, token, { userId: user.id }));
      response.send(token);
    })
    .catch(_logDatabaseError(response));

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
    .catch(_logDatabaseError(response));

const findUserAlbums = (request, response) =>
  users
    .findById(request.params.id)
    .then(user => user.getAlbums())
    .then(albums => response.send(albums))
    .catch(_logDatabaseError(response));

const findUserAlbumsPhotos = (request, response) =>
  users
    .findById(request.params.id)
    .then(user => user.getAlbums())
    .then(albums =>
      Promise.all(Array.from(albums, album => axios.get(`${photoEndpoint}?albumId=${album.id}`)))
    )
    .then(photosMatrix => response.send([].concat(...photosMatrix.map(res => res.data))))
    .catch(_logDatabaseError(response));

module.exports = { save, login, findAll, saveOrUpdateAdmin, findUserAlbums, findUserAlbumsPhotos };
