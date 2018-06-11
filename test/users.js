const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  { users, sequelize } = require('../app/models'),
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
    const validUser = {
      email: 'jane.doe@wolox.cl',
      password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC',
      firstName: 'Jane',
      lastName: 'Doe'
    };
    const user = {
      email: 'jane.doe@wolox.cl',
      password: '12345678'
    };

    users.create(validUser).then(() =>
      chai
        .request(server)
        .post('/users/sessions')
        .send(user)
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          expect(res.body.token).to.exist;

          dictum.chai(res, 'The generated token for the user');
          done();
        })
        .catch(err => done(err))
    );
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

  it('should fail and return error 503 when there is a problem with the database', done => {
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
