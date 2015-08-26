'use strict';

var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  sinon = require('sinon'),
  router = require('koa-router')(),
  koa = require('koa'),
  app = koa();

var config = require('./../../../config/app'),
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth-google');

require('./routes-auth-google')(router);

app
  .use(router.routes())
  .use(router.allowedMethods());

var server = http.createServer(app.callback());

describe('Routes', function () {

  describe('Auth', function () {

    describe('Google', function () {

      afterEach(function () {
        // Restore sinon stubs
        if (authController.googleCallback.restore) {
          authController.googleCallback.restore();
        }
      });

      describe('GET /signin/google', function () {

        it('should 302 redirect', function (done) {
          request(server)
            .get('/signin/google')
            .expect(302)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }
              res.headers.location.should.match(/https:\/\/accounts\.google\.com\/o\/oauth2\/auth.*/);
              done();
            });
        });

      });

      describe('GET /auth/google/callback', function () {

        it('should redirect to application error page on oauth access_denied response', function (done) {
          request(server)
            .get('/auth/google/callback?error=access_denied')
            .expect(302)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }
              res.headers.location.should.match(/.*ridesharemarket.com.*\/#!\/error\?error=access_denied/);
              done();
            });
        });

        it('should redirect to an application error page when missing required URL params', function (done) {
          request(server)
            .get('/auth/google/callback')
            .expect(302)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }
              res.headers.location.should.match(/.*ridesharemarket.com.*\/#!\/error/);
              done();
            });
        });

        it('should redirect to an application error page if authController.googleCallback errors', function (done) {

          sinon.stub(authController, 'googleCallback', function* () {
            yield new Error('Oops! Something blew up.');
          });

          request(server)
            .get('/auth/google/callback?code=abc123')
            .expect(302)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }
              res.headers.location.should.match(/.*ridesharemarket.com.*\/#!\/error/);
              done();
            });

        });

      });

    });

  });

});
