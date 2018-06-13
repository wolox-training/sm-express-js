const jwt = require('jwt-simple');

module.exports = async (...args) => jwt.decode(...args);
