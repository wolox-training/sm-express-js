const { findAll, save, login, saveOrUpdateAdmin, findUserAlbums } = require('./controllers/users'),
  { getAllAlbums, buyAlbum } = require('./controllers/albums'),
  { loggedIn, isAdmin, isAdminOrLoggedUser } = require('./middlewares/authorization'),
  userValidator = require('./middlewares/userValidator'),
  loginValidator = require('./middlewares/loginValidator'),
  passwordEncrypt = require('./middlewares/passwordEncrypt');

exports.init = app => {
  app.get('/albums', [loggedIn], getAllAlbums);
  app.post('/albums/:id', [loggedIn], buyAlbum);
  app.get('/users', [loggedIn], findAll);
  app.post('/users', [userValidator, passwordEncrypt], save);
  app.get('/users/:user_id/albums', [loggedIn, isAdminOrLoggedUser], findUserAlbums);
  app.post('/users/admin', [userValidator, loggedIn, isAdmin, passwordEncrypt], saveOrUpdateAdmin);
  app.post('/users/sessions', [loginValidator], login);
};
