const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  config = require('../config'),
  { users, albums, sequelize } = require('../app/models'),
  { registrationHtml } = require('../app/helper/htmlMessages'),
  jwt = require('jsonwebtoken'),
  { tokenUserIdOne, tokenUserIdTwo, tokenUserIdThree } = require('./testConstants'),
  nock = require('nock'),
  ms = require('smtp-tester'),
  expect = require('chai').expect;

describe('/users POST', () => {
  it('should save the new user in the database with role "regular" when it is valid and send an email', done => {
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: '12345678',
      role: 'admin'
    };
    const mailPromise = ms.init(config.common.email.port).captureOne('john.doe@wolox.cl', { wait: 3000 });
    chai
      .request(server)
      .post('/users')
      .send(validUser)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.password).to.be.undefined;
        expect(res.body.id).to.exist;
        expect(res.body.role).to.equal('regular');

        dictum.chai(res, 'The saved user without password but with the generated ID');
        return mailPromise.then(({ address, id, email }) => {
          expect(email.sender).to.equal(config.common.email.sender.email);
          expect(email.html).to.equal(registrationHtml(validUser));
          done();
        });
      })
      .catch(err => done(err));
  });

  it('should fail when the first name is undefined', done => {
    const invalidUser = {
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute firstName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the first name is null', done => {
    const invalidUser = {
      firstName: null,
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute firstName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the last name is undefined', done => {
    const invalidUser = {
      firstName: 'John',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute lastName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the last name is null', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: null,
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute lastName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is undefined', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is null', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: null,
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not from wolox domain', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not well formed', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doewolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is undefined', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is null', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: null
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password contains less than 8 chars', done => {
    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: '1234567'
    };

    chai
      .request(server)
      .post('/users')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the email is already registered', done => {
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users')
      .send(validUser)
      .then(() => {
        chai
          .request(server)
          .post('/users')
          .send(validUser)
          .catch(err => {
            const res = err.response;
            expect(res.status).to.equal(400);
            expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

            expect(res.body).to.equal('Key (email)=(john.doe@wolox.com.ar) already exists.');
            done();
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });
});

describe('/users/sessions POST', () => {
  it('should return the token for the saved user', done => {
    const user = {
      email: 'jane.doe@wolox.cl',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(user)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.token).to.exist;
        expect(res.body.expiresIn).to.equal(config.common.session.expireTime);

        const encodedUser = jwt.verify(res.body.token, config.common.session.secret);

        expect(encodedUser.id).to.exist;
        expect(encodedUser.password).be.undefined;
        expect(encodedUser.email).to.equal(user.email);

        dictum.chai(res, 'The generated token for the user');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is undefined', done => {
    const invalidUser = {
      email: 'john.doe@wolox.cl'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is null', done => {
    const invalidUser = {
      email: 'john.doe@wolox.cl',
      password: null
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password contains less than 8 chars', done => {
    const invalidUser = {
      email: 'john.doe@wolox.cl',
      password: '1234567'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is undefined', done => {
    const invalidUser = {
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is null', done => {
    const invalidUser = {
      email: null,
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not from wolox domain', done => {
    const invalidUser = {
      email: 'john.doe@gmail.com',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not well formed', done => {
    const invalidUser = {
      email: 'john.doewolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/sessions')
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  xit('should fail and return error 503 when there is a problem with the database', done => {
    const user = {
      email: 'john.doe@wolox.cl',
      password: '12345678'
    };

    sequelize.query('DROP TABLE users').then(() =>
      chai
        .request(server)
        .post('/users/sessions')
        .send(user)
        .catch(err => {
          const res = err.response;
          expect(res.status).to.equal(503);
          expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

          expect(res.body).to.equal('There was an error, please try again later');
          done();
        })
        .catch(err => done(err))
    );
  });
});

describe('/users GET', () => {
  it('should obtain all users, currentPage and totalPages', done => {
    const validToken = tokenUserIdOne;
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .query({ page })
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.result.length).to.equal(1);
        expect(res.body.result[0].id).to.equal(2);
        expect(res.body.result[0].firstName).to.equal('Jane');
        expect(res.body.result[0].lastName).to.equal('Doe');
        expect(res.body.result[0].email).to.equal('jane.doe@wolox.com.ar');
        expect(res.body.result[0].password).to.be.undefined;
        expect(res.body.currentPage).to.equal(page);
        expect(res.body.pages).to.equal(3);

        dictum.chai(res, 'Find all users validating if the user is authenticated');
        done();
      })
      .catch(err => done(err));
  });

  it('should obtain all users, totalPages and set currentPage to 1 if it is not passed in as query param', done => {
    const validToken = tokenUserIdOne;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.result.length).to.equal(1);
        expect(res.body.result[0].id).to.equal(1);
        expect(res.body.result[0].firstName).to.equal('Jane');
        expect(res.body.result[0].lastName).to.equal('Doe');
        expect(res.body.result[0].email).to.equal('jane.doe@wolox.cl');
        expect(res.body.result[0].password).to.be.undefined;
        expect(res.body.currentPage).to.equal(1);
        expect(res.body.pages).to.equal(3);
        done();
      })
      .catch(err => done(err));
  });

  it('should obtain all users, totalPages and set currentPage to the max page if the requested greater than the max', done => {
    const validToken = tokenUserIdOne;
    const page = 10000;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .query({ page })
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.result.length).to.equal(1);
        expect(res.body.result[0].id).to.equal(3);
        expect(res.body.result[0].firstName).to.equal('Noctis');
        expect(res.body.result[0].lastName).to.equal('Lucis');
        expect(res.body.result[0].email).to.equal('noctis.lucis@wolox.com.ar');
        expect(res.body.result[0].password).to.be.undefined;
        expect(res.body.currentPage).to.equal(3);
        expect(res.body.pages).to.equal(3);
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is expired', done => {
    const expiredToken = jwt.sign({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret, {
      expiresIn: '0s'
    });
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, expiredToken)
      .query({ page })
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
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, invalidToken)
      .query({ page })
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
    const validToken = tokenUserIdOne;
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set('x-access-token', validToken)
      .query({ page })
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
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .query({ page })
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

describe('/users/:id/albums GET', () => {
  it("should obtain all user's albums when the logged user is the same as requested", done => {
    const userId = 2;
    const validToken = tokenUserIdTwo;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.length).to.equal(2);
        expect(res.body[0].id).to.equal(1);
        expect(res.body[1].id).to.equal(2);

        dictum.chai(res, "Find all user's albums");
        done();
      })
      .catch(err => done(err));
  });

  it("should obtain all user's albums when the logged user is admin", done => {
    const userId = 2;
    const validToken = tokenUserIdThree;
    chai
      .request(server)
      .get(`/users/${userId}/albums`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.length).to.equal(2);
        expect(res.body[0].id).to.equal(1);
        expect(res.body[1].id).to.equal(2);

        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the logged user is the same as requested and it is not admin', done => {
    const userId = 1;
    const validToken = tokenUserIdTwo;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)
      .set(config.common.session.header_name, validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(403);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.equal('You do not have permission to access this resource');

        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is expired', done => {
    const expiredToken = jwt.sign({ id: 2, email: 'jane.doe@wolox.cl' }, config.common.session.secret, {
      expiresIn: '0s'
    });
    const userId = 1;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)
      .set(config.common.session.header_name, expiredToken)
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
    const userId = 1;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)
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
    const validToken = tokenUserIdOne;
    const userId = 1;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)
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
    const userId = 1;

    chai
      .request(server)
      .get(`/users/${userId}/albums`)

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

describe('/users/albums/:id/photos GET', () => {
  it("should obtain all user's albums photos when the logged user is the same as requested", done => {
    const userId = 2;
    const validToken = tokenUserIdTwo;

    const firstMockResponse = [
      {
        albumId: 1,
        id: 1,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
        url: 'http://placehold.it/600/92c952',
        thumbnailUrl: 'http://placehold.it/150/92c952'
      },
      {
        albumId: 1,
        id: 2,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
        url: 'http://placehold.it/600/92c952',
        thumbnailUrl: 'http://placehold.it/150/92c952'
      }
    ];

    const secondMockResponse = [
      {
        albumId: 2,
        id: 3,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
        url: 'http://placehold.it/600/92c952',
        thumbnailUrl: 'http://placehold.it/150/92c952'
      },
      {
        albumId: 2,
        id: 4,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
        url: 'http://placehold.it/600/92c952',
        thumbnailUrl: 'http://placehold.it/150/92c952'
      }
    ];

    nock(config.common.api.photosEndpointHost)
      .get(`${config.common.api.photosEndpointRoute}`)
      .query({ albumId: 1 })
      .reply(200, firstMockResponse);
    nock(config.common.api.photosEndpointHost)
      .get(`${config.common.api.photosEndpointRoute}`)
      .query({ albumId: 2 })
      .reply(200, secondMockResponse);

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
      .set(config.common.session.header_name, validToken)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.length).to.equal(4);
        expect(res.body).to.deep.equal([...firstMockResponse, ...secondMockResponse]);

        dictum.chai(res, "Find all user's albums' photos");
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the logged user is the same as requested and it is not admin', done => {
    const userId = 2;
    const validToken = tokenUserIdThree;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
      .set(config.common.session.header_name, validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(403);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.equal('You do not have permission to access this resource');

        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the logged user is the same as requested and it is not admin', done => {
    const userId = 1;
    const validToken = tokenUserIdTwo;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
      .set(config.common.session.header_name, validToken)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(403);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body).to.equal('You do not have permission to access this resource');

        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is expired', done => {
    const expiredToken = jwt.sign({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret, {
      expiresIn: '0s'
    });
    const userId = 1;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
      .set(config.common.session.header_name, expiredToken)
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
    const userId = 1;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
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
    const validToken = tokenUserIdOne;
    const userId = 1;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)
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
    const userId = 1;

    chai
      .request(server)
      .get(`/users/albums/${userId}/photos`)

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

describe('/users/admin POST', () => {
  it('should save the new user in the database with role "admin" when requester is admin', done => {
    const validToken = tokenUserIdThree;

    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: '12345678'
    };
    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(validUser)
      .then(res => {
        expect(res.status).to.equal(201);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');
        expect(res.body.password).to.be.undefined;
        expect(res.body.role).to.equal('admin');

        dictum.chai(res, 'The saved user with role admin');
        done();
      })
      .catch(err => done(err));
  });

  it('should update the user if it is already registered and update only the role', done => {
    const validToken = tokenUserIdThree;

    const validUserId = 1;
    const validUser = {
      firstName: 'BLAHBLAHBLAH',
      lastName: 'BLAHBLAHBLAH',
      email: 'jane.doe@wolox.cl',
      password: 'BLAHBLAHBLAH'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(validUser)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.password).to.be.undefined;

        return users.findById(validUserId);
      })
      .then(user => {
        expect(user.firstName).to.be.equal('Jane');
        expect(user.lastName).to.be.equal('Doe');
        expect(user.password).to.be.equal('$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC');
        expect(user.email).to.be.equal('jane.doe@wolox.cl');
        expect(user.role).to.be.equal('admin');

        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the first name is undefined', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute firstName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the first name is null', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: null,
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute firstName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the last name is undefined', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute lastName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the last name is null', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: null,
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute lastName does not fulfill the condition required:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is undefined', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is null', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: null,
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not from wolox domain', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the email is not well formed', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doewolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute email does not fulfill the condition woloxEmail:true');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is undefined', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password is null', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: null
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(2);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition required:true');
        expect(res.body[1]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail when the password contains less than 8 chars', done => {
    const validToken = tokenUserIdThree;

    const invalidUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: '1234567'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, validToken)
      .send(invalidUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(400);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body.length).to.equal(1);
        expect(res.body[0]).to.equal('The attribute password does not fulfill the condition minLength:8');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an admin user encoded', done => {
    const invalidToken = tokenUserIdOne;
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, invalidToken)
      .send(validUser)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(403);
        expect(res.header['content-type']).to.equal('application/json; charset=utf-8');

        expect(res.body).to.equal('You do not have permission to access this resource');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is expired', done => {
    const expiredToken = jwt.sign({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret, {
      expiresIn: '0s'
    });
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, expiredToken)
      .send(validUser)
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
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set(config.common.session.header_name, invalidToken)
      .send(validUser)
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
    const validToken = tokenUserIdOne;
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .set('x-access-token', validToken)
      .send(validUser)
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
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.com.ar',
      password: '12345678'
    };

    chai
      .request(server)
      .post('/users/admin')
      .send(validUser)
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
