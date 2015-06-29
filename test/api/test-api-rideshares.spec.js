'use strict';

var request = require('supertest'),
  should = require('chai').should(),
  assert = require('chai').assert,
  fs = require('fs');

var config = require('../../config/app'),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/valid_user_1_id.txt').toString(),
  rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString(),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  jwt = jwtManager.issueToken({name: 'Net Citizen', id: userIdFixture});

console.log('http://' + config.get('app').hostname + ':' + config.get('app').port);

var apiRequest = request('http://' + config.get('app').hostname + ':' + config.get('app').port);

describe('Rideshares', function () {

  // Create a valid rideshare from fixture data
  var rideshare = JSON.parse(rideshareFixture);
  rideshare.user = userIdFixture;

  var rideshareId;

  describe('POST /rideshares', function () {

    describe('accept', function () {

      it('should create a new rideshare', function (done) {
        apiRequest
          .post('/rideshares')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt)
          .send(JSON.stringify(rideshare))
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            var result = JSON.parse(res.text);
            result.rideshares.should.be.an.instanceof(Array);
            result.rideshares[0]._id.length.should.equal(24);
            // save the rideshare id for next tests
            rideshareId = result.rideshares[0]._id;
            done();
          });

      });

    });

  });

  describe('GET /rideshares/:id', function () {

    describe('accept', function () {

      it('should 200 with JSON API format', function (done) {
        apiRequest
          .get('/rideshares/' + rideshareId)
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            // Raw response test
            res.text.should.match(/{"rideshares":\[{"_id":.*}/);

            // Parse response test
            var jsonResponse = JSON.parse(res.text);

            should.exist(jsonResponse.rideshares);
            assert.isArray(jsonResponse.rideshares, 'Top level response property should be an Array');

            // First element in the response array should be a rideshare
            should.exist(jsonResponse.rideshares[0]);
            should.exist(jsonResponse.rideshares[0]._id);

            done();
          });
      });

    });

  });

  describe('GET /rideshares', function () {

    describe('accept', function () {

      it('should 200 with JSON API format', function (done) {
        apiRequest
          .get('/rideshares')
          .set('Accept', 'application/vnd.api+json')
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            // Raw response test
            res.text.should.match(/{"rideshares":\[{"_id":.*}/);

            // Parse response test
            var jsonResponse = JSON.parse(res.text);

            should.exist(jsonResponse.rideshares);
            assert.isArray(jsonResponse.rideshares, 'Top level response property should be an Array');

            // First element in the response array should be a rideshare
            should.exist(jsonResponse.rideshares[0]);
            should.exist(jsonResponse.rideshares[0]._id);

            done();
          });
      });

    });

  });

  describe('DELETE /rideshares/:id', function () {

    describe('accept', function () {

      it('should destroy a rideshare', function (done) {

        apiRequest
          .del('/rideshares/' + rideshareId)
          .set('Accept', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt)
          .expect('Content-Type', /application\/vnd\.api\+json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              return done(err);
            }

            var result = JSON.parse(res.text);
            // TODO: should be to user/:id
            // {"meta":{"location":"/rideshares/user"}}
            should.exist(result.meta.location);
            done();
          });

      });

    });

  });

});
