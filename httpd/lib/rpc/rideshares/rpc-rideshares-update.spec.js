'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcCreateRideshare = require('./rpc-rideshares-create'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id'),
  rpcUpdateRideshare = require('./rpc-rideshares-update');

var rideshareFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_post_200_rideshare_1.json').toString()),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/valid_user_1_id.txt').toString(),
  rideshareUpdate;

rideshareFixture.user = userIdFixture;

describe('RPC Rideshares', function () {

  describe('Update', function () {

    beforeEach(function (done) {
      rpcCreateRideshare(rideshareFixture).then(function (res) {
        rideshareUpdate = {
          _id: res.result._id,
          itinerary: res.result.itinerary
        };
      })
      .then(done, done);
    });

    afterEach(function (done) {
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
      done();
    });

    afterEach(function (done) {
      rpcRemoveRideshareById(rideshareUpdate._id).then(function () {
        done();
      });
    });

    it('should update an existing rideshare', function (done) {

      should.exist(rpcUpdateRideshare);

      // Update a rideshare property
      rideshareUpdate.itinerary.type.should.equal('Wanted');
      rideshareUpdate.itinerary.type = 'Offering';

      rpcUpdateRideshare(rideshareUpdate).then(function (res) {
        res.result.itinerary.type.should.equal('Offering');
      })
        .then(done, done);

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 503, message: 'Service Unavailable'});
      });

      rpcUpdateRideshare(rideshareUpdate).catch(function rpcCreateRideshareError(err) {
        err.code.should.equal(503);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

});
