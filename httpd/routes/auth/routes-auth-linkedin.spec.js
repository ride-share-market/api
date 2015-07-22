'use strict';

var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  sinon = require('sinon'),
  router = require('koa-router')(),
  koa = require('koa'),
  app = koa();

var config = require('./../../../config/app'),
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth-linkedin');

require('./routes-auth-linkedin')(router);

app
  .use(router.routes())
  .use(router.allowedMethods());

var server = http.createServer(app.callback());

describe('Routes', function () {

  describe('Auth', function () {

    describe('Linkedin', function () {

      afterEach(function () {
        // Restore sinon stubs
        if (authController.linkedinCallback.restore) {
          authController.linkedinCallback.restore();
        }
      });

      describe('GET /signin/linkedin', function () {

        it('should 302 redirect', function (done) {
          request(server)
            .get('/signin/linkedin')
            .expect(302)
            .end(function (err, res) {
              if (err) {
                should.not.exist(err);
                return done(err);
              }
              res.headers.location.should.match(/https:\/\/www\.linkedin\.com\/uas\/oauth2\/authorization\?response_type=code&client_id=.*&redirect_uri=.*&state=.*/);
              done();
            });
        });

      });

      describe('GET /auth/facebook/callback', function () {

        it('should redirect to an application error page when missing required URL params', function (done) {
          request(server)
            .get('/auth/linkedin/callback')
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

        it('should redirect to application error page on oauth access_denied response', function (done) {
          request(server)
            .get('/auth/linkedin/callback?error=access_denied&error_description=the+user+denied+your+request&state=465ae637-4b07-4e3e-b75b-5b07415bcc41')
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

        it('should redirect to an application error page if authController.linkedinCallback errors', function (done) {

          sinon.stub(authController, 'linkedinCallback', function* () {
            yield new Error('Oops! Something blew up.');
          });

          request(server)
            .get('/auth/linkedin/callback?code=abc123')
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
