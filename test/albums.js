const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  config = require('../config'),
  jwt = require('jwt-simple'),
  { users, albums } = require('../app/models'),
  nock = require('nock'),
  expect = require('chai').expect;

describe('/albums GET', () => {
  it('should obtain the albums list from url "https://jsonplaceholder.typicode.com/albums" and return the response as is', done => {
    const mockResponse = [
      {
        userId: Math.floor(Math.random() * 1000),
        id: Math.floor(Math.random() * 1000),
        title: 'Lorem ipsum dolor sit amet'
      },
      {
        userId: Math.floor(Math.random() * 1000),
        id: Math.floor(Math.random() * 1000),
        title: 'consectetur adipiscing elit'
      }
    ];
    nock(config.common.api.albumsEndpointHost)
      .get(config.common.api.albumsEndpointRoute)
      .reply(200, mockResponse);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.deep.equal(mockResponse);

        dictum.chai(res, 'The albums list');
        done();
      })
      .catch(err => done(err));
  });

  it('should return the error as is when the site answer an error', done => {
    const mockError = { message: 'Vivamus convallis diam in nisi maximus dictum.' };
    nock(config.common.api.albumsEndpointHost)
      .get(config.common.api.albumsEndpointRoute)
      .reply(503, mockError);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, validToken)
      .catch(err => {
        const res = err.response;

        expect(res.status).to.equal(503);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.deep.equal(mockError);
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain valid id and email combination', done => {
    const invalidToken = jwt.encode({ id: 3, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token data');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an email without calling the database', done => {
    const invalidToken = jwt.encode({ id: 1 }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an id without calling the database', done => {
    const invalidToken = jwt.encode({ email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is invalid', done => {
    const invalidToken = 'blahblah';

    chai
      .request(server)
      .get('/albums')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is not in the correct header key', done => {
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/albums')
      .set('x-access-token', validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Missing authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if there is no token in the header', done => {
    chai
      .request(server)
      .get('/albums')
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Missing authorization token');
        done();
      })
      .catch(err => done(err));
  });
});

describe('/albums/:id POST', () => {
  it('should assign the album to the user', done => {
    const desiredId = Math.floor(Math.random() * 100) + 2;
    const mockResponse = {
      userId: Math.floor(Math.random() * 1000),
      id: desiredId,
      title: `consectetur adipiscing elit ${Math.floor(Math.random() * 1000)}`
    };
    nock(config.common.api.albumsEndpointHost)
      .get(`${config.common.api.albumsEndpointRoute}/${desiredId}`)
      .reply(200, mockResponse);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post(`/albums/${desiredId}`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.id).to.equal(desiredId);
        expect(res.body.title).to.equal(mockResponse.title);
        expect(res.body.userId).to.be.undefined;
        expect(res.body.createdAt).to.exist;
        expect(res.body.updatedAt).to.exist;

        dictum.chai(res, 'The purchased album');
        return users.findById(1);
      })
      .then(user => user.getAlbums())
      .then(userAlbums => {
        expect(userAlbums.length).to.equal(1);
        expect(userAlbums[0].id).to.equal(desiredId);
        expect(userAlbums[0].title).to.equal(mockResponse.title);
        done();
      })
      .catch(err => done(err));
  });

  it('should assign the album to the user and no recreate it if already exists', done => {
    const desiredId = 1;
    const mockResponse = {
      userId: Math.floor(Math.random() * 1000),
      id: desiredId,
      title: `consectetur adipiscing elit ${Math.floor(Math.random() * 1000)}`
    };
    nock(config.common.api.albumsEndpointHost)
      .get(`${config.common.api.albumsEndpointRoute}/${desiredId}`)
      .reply(200, mockResponse);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post(`/albums/${desiredId}`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        return albums.findAndCountAll();
      })
      .then(data => {
        expect(data.count).to.equal(1);
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the album is already bought', done => {
    const desiredId = Math.floor(Math.random() * 100);
    const mockResponse = {
      userId: Math.floor(Math.random() * 1000),
      id: desiredId,
      title: `consectetur adipiscing elit ${Math.floor(Math.random() * 1000)}`
    };
    nock(config.common.api.albumsEndpointHost)
      .get(`${config.common.api.albumsEndpointRoute}/${desiredId}`)
      .reply(200, mockResponse);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post(`/albums/${desiredId}`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        return chai
          .request(server)
          .post(`/albums/${desiredId}`)
          .set(config.common.session.header_name, validToken);
      })
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Already bought this album');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the album does not exists', done => {
    const desiredId = Math.floor(Math.random() * 100);
    const mockResponse = {};
    nock(config.common.api.albumsEndpointHost)
      .get(`${config.common.api.albumsEndpointRoute}/${desiredId}`)
      .reply(200, mockResponse);

    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post(`/albums/${desiredId}`)
      .set(config.common.session.header_name, validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('The album does not exist');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain valid id and email combination', done => {
    const invalidToken = jwt.encode({ id: 3, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post('/albums/1')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token data');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an email without calling the database', done => {
    const invalidToken = jwt.encode({ id: 1 }, config.common.session.secret);

    chai
      .request(server)
      .post('/albums/1')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an id without calling the database', done => {
    const invalidToken = jwt.encode({ email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post('/albums/1')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is invalid', done => {
    const invalidToken = 'blahblah';

    chai
      .request(server)
      .post('/albums/1')
      .set(config.common.session.header_name, invalidToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is not in the correct header key', done => {
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .post('/albums/1')
      .set('x-access-token', validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Missing authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if there is no token in the header', done => {
    chai
      .request(server)
      .post('/albums/1')
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(401);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('Missing authorization token');
        done();
      })
      .catch(err => done(err));
  });
});
