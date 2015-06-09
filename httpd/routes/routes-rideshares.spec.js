'use strict';

var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  router = require('koa-router')(),
  koa = require('koa'),
  koaJsonApiHeaders = require('koa-jsonapi-headers'),
  bodyParser = require('koa-bodyparser'),
  app = koa(),
  fs = require('fs');

var config = require('../../config/app'),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user_id.txt').toString(),
  rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_1.json').toString(),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  jwt = jwtManager.issueToken({name: 'Net Citizen', id: userIdFixture}),
  jwt2 = jwtManager.issueToken({name: 'Net Citizen 2', id: '5530c570a59afc0d00d9cfdd'}),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rideshare;

//setup error handling
//setup JSON API response header (this is handled by 'koa-json-logger' in live)
app.use(function *(next) {
  try {
    yield next;
    this.response.type = 'application/vnd.api+json';
  }
  catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.response.type = 'application/vnd.api+json';
  }
});

//setup JSON API
app.use(koaJsonApiHeaders());

//enable POST
app.use(bodyParser());

//routes to test
require('./routes-rideshares')(router);

//enable routing
app
  .use(router.routes())
  .use(router.allowedMethods());

var server = http.createServer(app.callback());



describe('Routes', function() {

  describe('Rideshares', function () {

    afterEach(function (done) {
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
      done();
    });

    describe('POST', function() {

      it('should 200 create a new rideshare', function(done) {

        request(server)
          .post('/rideshares')
          .set('Accept', 'application/vnd.api+json')
          .set('Content-Type', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt)
          .send(rideshareFixture)
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
            rideshare = result.rideshares[0];
            done();
          });

      });

    });

    describe('GET', function() {

      it('should 200 rideshares/:id', function (done) {
        request(server)
          .get('/rideshares/' + rideshare._id)
          .set('Accept', 'application/vnd.api+json')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"rideshares":\[{"_id":"/);
            var result = JSON.parse(res.text);
            result.rideshares.should.be.an.instanceof(Array);
            result.rideshares.length.should.equal(1);
            result.rideshares[0]._id.should.equal(rideshare._id);
            done();
          });
      });

      it('should 200 rideshares', function (done) {
        request(server)
          .get('/rideshares')
          .set('Accept', 'application/vnd.api+json')
          .expect(200)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"rideshares":\[{"_id":"/);
            done();
          });
      });

      it('should 503 handle rideshares errors', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.reject({
            code: 503,
            message: 'service_unavailable',
            data: 'Service Unavailable'
          });
        });

        request(server)
          .get('/rideshares')
          .set('Accept', 'application/vnd.api+json')
          .expect(503)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"errors":\[{"code":"service_unavailable","title":"Service\ Unavailable"}\]}/);
            done();
          });
      });

      it('should 404 rideshares/:id', function (done) {
        request(server)
          .get('/rideshares/553928038122fd0d0024bd11')
          .set('Accept', 'application/vnd.api+json')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"errors":\[{"code":"not_found","title":"/);
            done();

          });
      });

    });

    describe('PUT', function() {

      it('should 200 update a rideshare', function(done) {

        rideshare.itinerary.type.should.equal('Wanted');
        rideshare.itinerary.type = 'Offering';

        request(server)
          .put('/rideshares/' + rideshare._id)
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
            result.rideshares[0]._id.should.equal(rideshare._id);
            done();
          });

      });

    });

    describe('DEL', function() {

      it('should 401 reject non owner delete rideshare request', function (done) {
        request(server)
          .del('/rideshares/' + rideshare._id)
          .set('Accept', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt2)
          .expect(401)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"errors":\[{"code":"authorization_required"/);
            done();
          });
      });

      it('should 200 delete a rideshare', function (done) {
        request(server)
          .del('/rideshares/' + rideshare._id)
          .set('Accept', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"meta":{"location":"/);
            done();
          });
      });

      it('should 404 unknown rideshare', function (done) {
        request(server)
          .del('/rideshares/553928038122fd0d0024bd11')
          .set('Accept', 'application/vnd.api+json')
          .set('Authorization', 'Bearer ' + jwt)
          .expect(404)
          .end(function (err, res) {
            if (err) {
              should.not.exist(err);
              return done(err);
            }
            res.text.should.match(/{"errors":\[{"code":"not_found","title":"/);
            done();
          });
      });

    });

  });

});
