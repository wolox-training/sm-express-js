const { findAll, save, login } = require('./controllers/users'),
  authorization = require('./middlewares/authorization'),
  userValidator = require('./middlewares/userValidator'),
  loginValidator = require('./middlewares/loginValidator'),
  passwordEncrypt = require('./middlewares/passwordEncrypt');

exports.init = app => {
  app.get('/users', [authorization], findAll);
  app.post('/users', [userValidator, passwordEncrypt], save);
  app.post('/users/sessions', [loginValidator], login);
};
