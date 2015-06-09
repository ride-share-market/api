'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  ridesharesFindAll = require('./controller-rideshares-find-all');

var rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response_rpc-rideshares.json').toString();

describe('Controllers', function () {

  describe('Rideshares', function () {

    describe('Find All', function () {

      afterEach(function (done) {
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        done();
      });

      it('should return an array of Rideshares', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.resolve(rideshareFixture);
        });

        ridesharesFindAll().then(function ridesharesFindAllSuccess(res) {
          should.exist(res.rideshares);
          res.rideshares.should.be.an.instanceof(Array);
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

        ridesharesFindAll().catch(function ridesharesFindAllError(err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);

      });

    });

  });

});
