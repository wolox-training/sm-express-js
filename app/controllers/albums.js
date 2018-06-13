const axios = require('axios'),
  config = require('../../config').common.api;

const getAllAlbums = (request, response) =>
  axios
    .get(config.albumsEndpoint)
    .then(res => response.json(res.data))
    .catch(err => response.status(err.response.status).json(err.response.data));

module.exports = { getAllAlbums };
