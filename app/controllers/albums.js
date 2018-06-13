const axios = require('axios');

const getAllAlbums = (request, response) =>
  axios
    .get('https://jsonplaceholder.typicode.com/albums')
    .then(res => response.json(res.data))
    .catch(err => response.status(err.response.status).json(err.response.data));

module.exports = { getAllAlbums };
