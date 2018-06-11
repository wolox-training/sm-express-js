const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  config = require('../config'),
  { sequelize } = require('../app/models'),
  jwt = require('jwt-simple'),
  should = chai.should(),
  expect = require('chai').expect;

describe('/users POST', () => {
  it('should save the new user in the database when it is valid', done => {
    const validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@wolox.cl',
      password: '12345678'
    };
    chai
      .request(server)
      .post('/users')
      .send(validUser)
      .then(res => {
        res.should.have.status(201);
        res.should.be.json;
        expect(res.body.password).to.be.undefined;
        expect(res.body.id).to.exist;

        dictum.chai(res, 'The saved user without password but with the generated ID');
        done();
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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
            res.should.have.status(400);
            res.should.be.json;

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
        res.should.have.status(200);
        res.should.be.json;
        expect(res.body.token).to.exist;

        const encodedUser = jwt.decode(res.body.token, config.common.session.secret);

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
        res.should.have.status(400);
        res.should.be.json;

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
          res.should.have.status(503);
          res.should.be.json;

          expect(res.body).to.equal('There was an error, please try again later');
          done();
        })
        .catch(err => done(err))
    );
  });
});

describe('/users GET', () => {
  it('should obtain all users, currentPage and totalPages', done => {
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .query({ page })
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
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
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
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
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);
    const page = 10000;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, validToken)
      .query({ page })
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
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

  it('should fail if the token does not contain valid id and email combination', done => {
    const invalidToken = jwt.encode({ id: 3, email: 'jane.doe@wolox.cl' }, config.common.session.secret);
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, invalidToken)
      .query({ page })
      .catch(err => {
        const res = err.response;
        res.should.have.status(401);
        res.should.be.json;

        expect(res.body).to.equal('Invalid authorization token data');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an email without calling the database', done => {
    const invalidToken = jwt.encode({ id: 1 }, config.common.session.secret);
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, invalidToken)
      .query({ page })
      .catch(err => {
        const res = err.response;
        res.should.have.status(401);
        res.should.be.json;

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token does not contain an id without calling the database', done => {
    const invalidToken = jwt.encode({ email: 'jane.doe@wolox.cl' }, config.common.session.secret);
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set(config.common.session.header_name, invalidToken)
      .query({ page })
      .catch(err => {
        const res = err.response;
        res.should.have.status(401);
        res.should.be.json;

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
        res.should.have.status(401);
        res.should.be.json;

        expect(res.body).to.equal('Invalid authorization token');
        done();
      })
      .catch(err => done(err));
  });

  it('should fail if the token is not in the correct header key', done => {
    const validToken = jwt.encode({ id: 1, email: 'jane.doe@wolox.cl' }, config.common.session.secret);
    const page = 2;

    chai
      .request(server)
      .get('/users')
      .set('x-access-token', validToken)
      .query({ page })
      .catch(err => {
        const res = err.response;
        res.should.have.status(401);
        res.should.be.json;

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
        res.should.have.status(401);
        res.should.be.json;

        expect(res.body).to.equal('Missing authorization token');
        done();
      })
      .catch(err => done(err));
  });
});
