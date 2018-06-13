const jwt = require('jwt-simple');

const jwtDecode = async (token, secret) => jwt.decode(token, secret);
const to = promise => promise.then(data => [null, data]).catch(err => [err]);

module.exports = { to, jwtDecode };
