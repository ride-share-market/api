'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcCreateRideshare = require('./rpc-rideshares-create'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id');

var rideshareFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_1.json').toString()),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user1_id.txt').toString();

rideshareFixture.user = userIdFixture;

describe('RPC Rideshares', function () {

  describe('Create', function () {

    afterEach(function (done) {
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
      done();
    });

    it('should create a new rideshare', function (done) {

      should.exist(rpcCreateRideshare);

      rpcCreateRideshare(rideshareFixture).then(
        function (res) {
          should.exist(res.result._id);
          return q.resolve(res.result._id);
        }
      )
        .then(function (id) {
          return rpcRemoveRideshareById(id);
        })
        .then(function () {
          done();
        });

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 503, message: 'Service Unavailable'});
      });

      rpcCreateRideshare(rideshareFixture).catch(function rpcCreateRideshareError(err) {
        err.code.should.equal(503);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

});
