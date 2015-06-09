'use strict';

var should = require('chai').should(),
  assert = require('chai').assert,
  request = require('supertest'),
  koa = require('koa');

var config = require('./../../config/app'),
  auth = require('./authorization'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager');

describe('Middleware', function () {

  describe('Authorization', function () {

    describe('reject', function () {

      it('should 401 reject a missing Authorization header', function (done) {

        var app = koa();

        app.use(function *(next) {
          try {
            yield next;
          }
          catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
          }
        });

        app.use(auth());

        // default route
        app.use(function *(next) {
          yield next;
        });

        request(app.listen())
          .get('/')
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

      it('should 401 reject a bad format Authorization header missing Bearer keyword', function (done) {

        var jwt = jwtManager.issueToken({name: 'Test'});

        var app = koa();

        app.use(function *(next) {
          try {
            yield next;
          }
          catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
          }
        });

        app.use(auth());

        // default route
        app.use(function *(next) {
          yield next;
        });

        request(app.listen())
          .get('/')
          .set('Authorization', jwt)
          .expect(401)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }

            assert.isArray(res.body.errors, 'Top level response property should be an Array');
            res.body.errors[0].code.should.equal('invalid_request');
            res.body.errors[0].title.should.equal('Bad authorization header format. Format is "Authorization: Bearer <token>"');

            done();
          });

      });

      it('should 401 reject a bad format Authorization header', function (done) {

        var jwt = jwtManager.issueToken({name: 'Test'});

        var app = koa();

        app.use(function *(next) {
          try {
            yield next;
          }
          catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
          }
        });

        app.use(auth());

        // default route
        app.use(function *(next) {
          yield next;
        });

        request(app.listen())
          .get('/')
          .set('Authorization', 'Bear ' + jwt)
          .expect(401)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }

            assert.isArray(res.body.errors, 'Top level response property should be an Array');
            res.body.errors[0].code.should.equal('invalid_request');
            res.body.errors[0].title.should.equal('Bad authorization header format. Format is "Authorization: Bearer <token>"');

            done();
          });

      });

      it('should 401 reject invalid authorization credentials', function (done) {

        var app = koa();

        app.use(function *(next) {
          try {
            yield next;
          }
          catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
          }
        });

        app.use(auth());

        // default route
        app.use(function *(next) {
          yield next;
        });

        request(app.listen())
          .get('/')
          .set('Authorization', 'Bearer abc123')
          .expect(401)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }

            assert.isArray(res.body.errors, 'Top level response property should be an Array');
            res.body.errors[0].code.should.equal('authorization_required');
            res.body.errors[0].title.should.equal('Please sign in to complete this request.');

            done();
          });

      });

    });

    describe('accept', function () {

      it('should 200 accept with a valid JWT Token', function (done) {

        // valid authorization jwt
        var jwt = jwtManager.issueToken({name: 'Test'});

        var app = koa();

        app.use(auth());

        // default route
        app.use(function *(next) {
          this.body = {test: 'OK'};
          yield next;
        });

        request(app.listen())
          .get('/')
          .set('Authorization', 'Bearer ' + jwt)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.body.test.should.equal('OK');
            done();
          });

      });

      it('should pass through downstream errors', function (done) {

        // valid authorization jwt
        var jwt = jwtManager.issueToken({name: 'Test'});

        var app = koa();

        app.use(function *(next) {
          try {
            yield next;
          }
          catch (err) {
            this.status = err.status || 500;
            this.body = err.message;
          }
        });

        app.use(auth());

        // Downstream error after auth()
        app.use(function *route1(next) {
          this.throw(500, 'Oops! Something blew up.');
          yield next;
        });

        // Expect a 500 error *not* a 401 from the middleware
        request(app.listen())
          .get('/')
          .set('Authorization', 'Bearer ' + jwt)
          .expect(500)
          .end(function (err) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            done();
          });

      });

    });

  });

});
