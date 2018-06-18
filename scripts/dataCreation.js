const { users, albums, sessions } = require('../app/models'),
  userCreate = users.create.bind(users),
  albumCreate = albums.create.bind(albums),
  sessionCreate = sessions.create.bind(sessions),
  firstAlbum = {
    id: 1,
    title: 'Lorem ipsum'
  },
  secondAlbum = {
    id: 2,
    title: 'dolor sit amet'
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
  firstSession = {
    userId: 1,
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqYW5lLmRvZUB3b2xveC5jbCIsImlhdCI6MTUyOTA4MjIzNX0.eOBB1BQtLi4rRnFp29r4FClVoB4NirwsAPVvgBkZjFQ'
  },
  secondSession = {
    userId: 2,
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJqYW5lLmRvZUB3b2xveC5jbCJ9.D4R0mjFatw7HNH6ur8GyUlupV6qfNS8Czu_2Ka7RKM8'
  },
  thirdSession = {
    userId: 3,
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJub2N0aXMubHVjaXNAd29sb3guY29tLmFyIiwiaWF0IjoxNTI5MDg0MDQ2fQ.ld-WWXVn30UzsLN6nddnpcJzsE93NoxI_mGtsyiswms'
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
    wrap(albumCreate, secondAlbum),
    wrap(sessionCreate, firstSession),
    wrap(sessionCreate, secondSession),
    wrap(sessionCreate, thirdSession),
    createRelationship(2, 1),
    createRelationship(2, 2)
  ].reduce((p, fn) => p.then(fn), Promise.resolve());
