const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  config = require('../config'),
  { sessions } = require('../app/models'),
  jwt = require('jsonwebtoken'),
  { tokenUserIdOne } = require('./testConstants'),
  expect = require('chai').expect;

describe('/users/sessions/invalidate_all POST', () => {
  it('should remove all the active sessions for the user', done => {
    Promise.all([
      sessions.create({ token: 'token1', userId: 1 }),
      sessions.create({ token: 'token2', userId: 1 }),
      sessions.create({ token: 'token3', userId: 1 })
    ])
      .then(() => {
        return chai
          .request(server)
          .post('/users/sessions/invalidate_all')
          .set(config.common.session.header_name, tokenUserIdOne);
      })
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.equal('All sessions for user Jane deleted');

        dictum.chai(res, 'Message informing the correct deletion of the sessions');
        return sessions.findAndCountAll();
      })
      .then(data => {
        expect(data.count).to.equal(2);
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is expired', done => {
    const expiredToken = jwt.sign({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret, {
      expiresIn: '0s'
    });

    sessions
      .create({ token: expiredToken, userId: 1 })
      .then(() =>
        chai
          .request(server)
          .post('/users/sessions/invalidate_all')
          .set(config.common.session.header_name, expiredToken)
      )
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
      .post('/users/sessions/invalidate_all')
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
    chai
      .request(server)
      .post('/users/sessions/invalidate_all')
      .set('x-token-access', tokenUserIdOne)
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
      .post('/users/sessions/invalidate_all')
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
