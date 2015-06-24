'use strict';

var should = require('chai').should(),
  assert = require('chai').assert,
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rideshareCreate = require('./controller-rideshares-create'),
  ridesharesRemoveById = require('./controller-rideshares-remove-by-id');

var rideshareFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_1.json').toString()),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user1_id.txt').toString();

rideshareFixture.user = userIdFixture;

describe('Controllers', function () {

  describe('Rideshares', function () {

    describe('Create', function () {

      afterEach(function (done) {
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        done();
      });

      it('should create a rideshare', function (done) {
        return rideshareCreate(rideshareFixture).then(function (res) {
          assert.isArray(res.rideshares, 'Top level response property should be an Array');
          should.exist(res.rideshares[0]._id);
          return q.resolve(res.rideshares[0]._id);
        })
          .then(function (id) {
            return ridesharesRemoveById(id);
          })
          .then(function () {
            done();
          });

      });

      it('should handle validation errors', function (done) {

        rideshareCreate({invalid: true}).catch(function (err) {
          err.status.should.equal(400);
          assert.isArray(err.errors, 'Errors property should be an Array');
          err.errors[0].code.should.equal('validation_error');
        })
          .then(done, done);

      });

      it('should handle RPC connections errors', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.reject({
            code: 503,
            message: 'service_unavailable',
            data: 'Service Unavailable'
          });
        });

        rideshareCreate({}).catch(function (err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);

      });

    });

  });

});
