const jwt = require('jsonwebtoken');

module.exports = async (...args) => jwt.verify(...args);
