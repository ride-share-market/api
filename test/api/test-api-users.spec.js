'use strict';

var request = require('supertest'),
  should = require('chai').should(),
  assert = require('chai').assert,
  fs = require('fs');

var config = require('../../config/app'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  jwt = jwtManager.issueToken({name: 'Net Citizen'});

console.log('http://' + config.get('app').hostname + ':' + config.get('app').port);

var apiRequest = request('http://' + config.get('app').hostname + ':' + config.get('app').port);

var userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user_id.txt').toString();

describe('Users', function () {

  describe('Authorized requests', function () {

    describe('GET /users/:id', function () {

      describe('reject', function () {

        describe('accept header', function () {

          it('should 400 requires accept header', function (done) {
            apiRequest
              .get('/users/539d77e8cd4e834b710a103a')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(400)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }
                // Test: response is a collection of objects keyed by "errors"
                res.text.should.match(/{"errors":\[{.*}/);

                // Parse response test
                var jsonResponse = JSON.parse(res.text);

                should.exist(jsonResponse.errors);
                assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

                jsonResponse.errors[0].code.should.equal('invalid_request');
                jsonResponse.errors[0].title.should.equal('API requires header "Accept application/vnd.api+json" for exchanging data.');

                done();
              });
          });

        });

        describe('authorization', function () {

          it('should 401 no authorization header', function (done) {
            apiRequest
              .get('/users/539d77e8cd4e834b710a103a')
              .set('Accept', 'application/vnd.api+json')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(401)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                // Test: response is a collection of objects keyed by "errors"
                res.text.should.match(/{"errors":\[{.*}/);

                // Parse response test
                var jsonResponse = JSON.parse(res.text);

                should.exist(jsonResponse.errors);
                assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

                jsonResponse.errors[0].code.should.equal('invalid_request');
                jsonResponse.errors[0].title.should.equal('Authorization header not found');

                done();
              });
          });

          it('should 401 bad authorization header format', function (done) {
            apiRequest
              .get('/users/539d77e8cd4e834b710a103a')
              .set('Accept', 'application/vnd.api+json')
              .set('Authorization', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiTmV0IENpdGl6ZW4iLCJpYXQiOjE0MDYyNjc1ODB9.nD4JZi4XRwT8eJcdHyc8Ut9vfjFAW_52teSfgL4EeKc')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(401)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                // Test: response is a collection of objects keyed by "errors"
                res.text.should.match(/{"errors":\[{.*}/);

                // Parse response test
                var jsonResponse = JSON.parse(res.text);

                should.exist(jsonResponse.errors);
                assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

                jsonResponse.errors[0].code.should.equal('invalid_request');
                jsonResponse.errors[0].title.should.equal('Bad authorization header format. Format is "Authorization: Bearer <token>"');

                done();
              });
          });

          it('should 401 invalid JWT token', function (done) {
            apiRequest
              .get('/users/539d77e8cd4e834b710a103a')
              .set('Accept', 'application/vnd.api+json')
              .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiTmV0IENpdGl6ZW4iLCJpYXQiOjE0MDYyNjc1ODB9.nD4JZi4XRwT8eJcdHyc8Ut9vfjFAW_52teSfgL4EeKb')
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(401)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                // Test: response is a collection of objects keyed by "errors"
                res.text.should.match(/{"errors":\[{.*}/);

                // Parse response test
                var jsonResponse = JSON.parse(res.text);

                should.exist(jsonResponse.errors);
                assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

                jsonResponse.errors[0].code.should.equal('authorization_required');
                jsonResponse.errors[0].title.should.equal('Please sign in to complete this request.');

                done();
              });
          });

        });

        describe('URL params validation', function () {

          it('should 400 non-valid users :id', function (done) {
            apiRequest
              .get('/users/123')
              .set('Content-Type', 'application/vnd.api+json')
              .set('Accept', 'application/vnd.api+json')
              .set('Authorization', 'Bearer ' + jwt)
              .expect('Content-Type', /application\/vnd\.api\+json/)
              .expect(400)
              .end(function (err, res) {
                if (err) {
                  return done(err);
                }

                // Test: response is a collection of objects keyed by "errors"
                res.text.should.match(/{"errors":\[{.*}/);

                // Parse response test
                var jsonResponse = JSON.parse(res.text);

                should.exist(jsonResponse.errors);
                assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

                jsonResponse.errors[0].code.should.equal('invalid_format');
                jsonResponse.errors[0].title.should.equal('Invalid user ID format.');

                done();
              });
          });

        });

      });

      describe('accept', function () {

        it('should 200 with JSON API format', function (done) {
          apiRequest
            .get('/users/' + userIdFixture)
            .set('Accept', 'application/vnd.api+json')
            .set('Authorization', 'Bearer ' + jwt)
            .expect('Content-Type', /application\/vnd\.api\+json/)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              // Raw response test
              res.text.should.match(/{"users":{"_id":/);

              // Parse response test
              var jsonResponse = JSON.parse(res.text);

              should.exist(jsonResponse.users);
              assert.isObject(jsonResponse.users, 'Top level response property should be an Object');

              // First element in the response array should be the requested user
              jsonResponse.users._id.should.equal(userIdFixture);

              done();
            });
        });

        it('should 404 unknown user account', function (done) {
          apiRequest
            .get('/users/542ecc5738cd267f52ac2081')
            .set('Accept', 'application/vnd.api+json')
            .set('Authorization', 'Bearer ' + jwt)
            .expect('Content-Type', /application\/vnd\.api\+json/)
            .expect(404)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              // Test: response is a collection of objects keyed by "errors"
              res.text.should.match(/{"errors":\[{.*}/);

              // Parse response test
              var jsonResponse = JSON.parse(res.text);

              should.exist(jsonResponse.errors);
              assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

              jsonResponse.errors[0].code.should.equal('not_found');
              jsonResponse.errors[0].title.should.equal('Account profile not found.');

              done();

            });

        });

      });

    });

  });

});
