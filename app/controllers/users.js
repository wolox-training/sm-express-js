const { users } = require('../models'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  config = require('../../config'),
  axios = require('axios'),
  to = require('../helper/to'),
  { ADMIN, REGULAR } = require('../roles'),
  logger = require('../logger'),
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
          const expiresIn = config.common.session.expireTime;
          response.send({
            token: jwt.sign(userData, config.common.session.secret, { expiresIn }),
            expiresIn
          });
        } else {
          response.status(401).json('The password does not match');
        }
      } else {
        response.status(401).json('The user does not exist');
      }
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
      Promise.all(
        Array.prototype.map.call(albums, album => axios.get(`${photoEndpoint}?albumId=${album.id}`))
      )
    )
    .then(photosMatrix => response.send([].concat(...photosMatrix.map(res => res.data))))
    .catch(_logDatabaseError(response));

module.exports = { save, login, findAll, saveOrUpdateAdmin, findUserAlbums, findUserAlbumsPhotos };
