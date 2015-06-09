'use strict';

var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  koa = require('koa'),
  app = koa();

require('./routes-default')(null, app);

var server = http.createServer(app.callback());

describe('Routes', function() {

  describe('Default', function () {

    describe('GET', function () {

      it('should 404 Page Not Found in HTML', function (done) {
        request(server)
          .get('/not/found')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.equal('<p>Page Not Found</p>');
            done();

          });
      });

      it('should 404 Page Not Found in vnd.api+json', function (done) {
        request(server)
          .get('/not/found')
          .set('Accept', 'application/vnd.api+json')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"message":"Page Not Found"}/);
            done();

          });
      });

      it('should 404 Page Not Found in json', function (done) {
        request(server)
          .get('/not/found')
          .set('Accept', 'application/json')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"message":"Page Not Found"}/);
            done();

          });
      });

      it('should 404 default Page Not Found in text', function (done) {
        request(server)
          .get('/not/found')
          .set('Accept', 'application/unknown')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/^Page\ Not\ Found$/);
            done();

          });
      });

    });

  });

});