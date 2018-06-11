const usersController = require('./controllers/users'),
  userValidator = require('./middlewares/userValidator'),
  loginValidator = require('./middlewares/loginValidator'),
  passwordEncrypt = require('./middlewares/passwordEncrypt');

exports.init = app => {
  app.post('/users', [userValidator, passwordEncrypt], usersController.save);
  app.post('/users/sessions', [loginValidator], usersController.login);
};
