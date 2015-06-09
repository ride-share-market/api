'use strict';

var should = require('chai').should(),
  assert = require('chai').assert,
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  ridesharesFindById = require('./controller-rideshares-find-by-id');

var rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response_rpc-rideshares-find-by-id.json').toString();

describe('Controllers', function () {

  describe('Rideshares', function () {

    describe('Find By ID', function () {

      afterEach(function (done) {
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        done();
      });

      it('should return an array with one Rideshare', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.resolve(rideshareFixture);
        });

        ridesharesFindById('54f4136c64cb08491774eee0').then(function ridesharesFindByIdSuccess(res) {
          should.exist(res.rideshares);
          res.rideshares.should.be.an.instanceof(Array);
          res.rideshares.length.should.equal(1);
          res.rideshares[0]._id.should.equal('54f4136c64cb08491774eee0');
        })
          .then(done, done);
      });

      it('should return 404', function (done) {

        ridesharesFindById('64449e565a2982eab34eb8e6').catch(function ridesharesFindByIdError(err) {
          err.status.should.equal(404);
          assert.isArray(err.errors, 'Top level response property should be an Array');
          err.errors[0].code.should.equal('not_found');
          err.errors[0].title.should.equal('Rideshare not found.');
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

        ridesharesFindById('54449e565a2982eab34eb8e5').catch(function ridesharesFindByIdError(err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);

      });

    });

  });

});
