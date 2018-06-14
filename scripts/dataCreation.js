const { users, albums, sequelize } = require('../app/models'),
  userCreate = users.create.bind(users),
  albumCreate = albums.create.bind(albums),
  firstAlbum = {
    id: 1,
    title: 'Lorem ipsum'
  },
  firstUser = {
    email: 'jane.doe@wolox.cl',
    password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
    firstName: 'Jane',
    lastName: 'Doe'
  },
  secondUser = {
    email: 'jane.doe@wolox.com.ar',
    password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
    firstName: 'Jane',
    lastName: 'Doe'
  },
  thirdUser = {
    email: 'noctis.lucis@wolox.com.ar',
    password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
    firstName: 'Noctis',
    lastName: 'Lucis',
    role: 'admin'
  },
  createRelationship = (userId, albumId) => () =>
    users.findById(userId).then(user => albums.findById(albumId).then(album => user.addAlbum(album)));

const wrap = (fn, ...args) => () => fn(...args);

exports.execute = () =>
  [
    wrap(userCreate, firstUser),
    wrap(userCreate, secondUser),
    wrap(userCreate, thirdUser),
    wrap(albumCreate, firstAlbum),
    createRelationship(2, 1)
  ].reduce((p, fn) => p.then(fn), Promise.resolve());
