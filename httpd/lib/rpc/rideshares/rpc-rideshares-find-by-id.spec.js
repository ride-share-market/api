'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcCreateRideshare = require('./rpc-rideshares-create'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id'),
  rpcFindRideshareById = require('./rpc-rideshares-find-by-id');

var rideshareFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString()),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/valid_user_1_id.txt').toString(),
  rideshare;

rideshareFixture.user = userIdFixture;

describe('RPC Rideshares', function () {

  describe('Find By ID', function () {

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

    it('should return an array with one rideshare', function (done) {

      should.exist(rpcFindRideshareById);

      rpcFindRideshareById(rideshare._id).then(function (res) {
        should.exist(res.result);
        res.result.should.be.instanceof(Array);
        res.result.length.should.equal(1);
        res.result[0]._id.should.equal(rideshare._id);
      })
        .then(done, done);

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 503, message: 'Service Unavailable'});
      });

      return rpcFindRideshareById(rideshare._id).catch(function (err) {
        err.code.should.equal(503);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

});
