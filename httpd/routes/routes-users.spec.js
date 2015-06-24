'use strict';

//require('co-mocha');
var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  assert = require('chai').assert,
  router = require('koa-router')(),
  koa = require('koa'),
  app = koa(),
  fs = require('fs');

app.use(function *(next) {
  try {
    yield next;
  }
  catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
  }
});

require('./routes-users')(router);

app
  .use(router.routes())
  .use(router.allowedMethods());

var config = require('./../../config/app'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  jwt;

var server = http.createServer(app.callback());

var userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user1_id.txt').toString();

describe('Routes', function () {

  describe('Users', function () {

    describe('GET /users/:id', function () {

      describe('unauthenticated', function () {

        it('should 401 reject without authorization', function (done) {
          request(server)
            .get('/users/539d77e8cd4e834b710a103a')
            .expect(401)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }

              assert.isArray(res.body.errors, 'Top level response property should be an Array');
              res.body.errors[0].code.should.equal('invalid_request');
              res.body.errors[0].title.should.equal('Authorization header not found');

              done();
            });
        });

      });

      describe('authenticated', function () {

        beforeEach(function (done) {
          jwt = jwtManager.issueToken({name: 'Test'});
          done();
        });

        it('should 400 reject non-valid userID parameter', function (done) {
          request(server)
            .get('/users/abc123')
            .set('Authorization', 'Bearer ' + jwt)
            .expect(400)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              assert.isArray(res.body.errors, 'Top level response property should be an Array');
              res.body.errors[0].code.should.equal('invalid_format');
              res.body.errors[0].title.should.equal('Invalid user ID format.');

              done();
            });
        });

        it('should 200 return a user object for a valid request', function (done) {
          request(server)
            .get('/users/' + userIdFixture)
            .set('Authorization', 'Bearer ' + jwt)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              // array response
              should.exist(res.body.users);
              assert.isObject(res.body.users, 'Top level response property should be an Object');

              // first element in the response array should be the requested user
              should.exist(res.body.users._id);
              res.body.users._id.should.equal(userIdFixture);

              done();
            });
        });

      });

    });

  });

});