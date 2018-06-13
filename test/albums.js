const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  config = require('../config'),
  jwt = require('jwt-simple'),
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
    nock('https://jsonplaceholder.typicode.com')
      .get('/albums')
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
    nock('https://jsonplaceholder.typicode.com')
      .get('/albums')
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
