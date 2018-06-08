const usersController = require('./controllers/users'),
  userValidator = require('./middlewares/userValidator'),
  passwordEncrypt = require('./middlewares/passwordEncrypt');

exports.init = app => {
  app.post('/users', [userValidator, passwordEncrypt], usersController.save);
};
