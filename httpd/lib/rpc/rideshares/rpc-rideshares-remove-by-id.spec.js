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
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user_id.txt').toString(),
  rideshare;

rideshareFixture.user = userIdFixture;

describe('RPC Rideshares', function() {

  describe('Remove By ID', function() {

    beforeEach(function (done) {
      rpcCreateRideshare(rideshareFixture).then(function (res) {
        rideshare = res.result;
        done();
      });
    });

    afterEach(function (done) {
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
      done();
    });

    afterEach(function (done) {
      rpcRemoveRideshareById(rideshare._id).then(function () {
        done();
      });
    });

    it('should remove a rideshare', function(done) {

      should.exist(rpcRemoveRideshareById);

      rpcRemoveRideshareById(rideshare._id).then(function rpcRemoveRideshareByIdSuccess(res) {
        res.result._id.should.equal(rideshare._id);
      })
        .then(done,done);

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 503, message: 'Service Unavailable'});
      });

      rpcRemoveRideshareById('5469c666b207c9564a1d2632').catch(function rpcRemoveRideshareByIdError(err) {
        err.code.should.equal(503);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });


});