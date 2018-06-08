const userController = require('./controllers/user'),
  userValidator = require('./middlewares/userValidator'),
  passwordEncrypt = require('./middlewares/passwordEncrypt');

exports.init = app => {
  app.post('/users', userValidator, passwordEncrypt, userController.save);
};
