const { albums } = require('../models'),
  axios = require('axios'),
  config = require('../../config').common.api,
  _err = (status, message) => ({ status, message });

const getAllAlbums = (request, response) =>
  axios
    .get(config.albumsEndpoint)
    .then(res => response.json(res.data))
    .catch(err => response.status(err.response.status).json(err.response.data));

const buyAlbum = (request, response) =>
  response.locals.loggedUser
    .getAlbums()
    .then(res => {
      if (res.filter(album => album.id === parseInt(request.params.id)).length)
        return Promise.reject(_err(400, 'Already bought this album'));

      return axios.get(`${config.albumsEndpoint}/${request.params.id}`);
    })
    .then(res => {
      if (!res.data.id) return Promise.reject(_err(400, 'The album does not exist'));

      const { id, title } = res.data;

      return albums.findCreateFind({ where: { id, title } });
    })
    .then(([album]) => {
      return response.locals.loggedUser.addAlbum(album).then(() => response.json(album));
    })
    .catch(({ status = 503, message = 'There was an error, please try again later' }) =>
      response.status(status).json(message)
    );

module.exports = { getAllAlbums, buyAlbum };
