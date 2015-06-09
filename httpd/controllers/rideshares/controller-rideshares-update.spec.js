'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rideshareUpdate = require('./controller-rideshares-update');

var rideshareFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_1.json').toString()),
  userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user_id.txt').toString(),
  rpcResult = fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response_rpc-rideshares.json');

rideshareFixture.user = userIdFixture;

describe('Controllers', function () {

  describe('Rideshares', function () {

    describe('Update', function () {

      afterEach(function (done) {
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        done();
      });

      it('should return a Rideshares JSON-RPC response', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.resolve(rpcResult);
        });

        rideshareUpdate(rideshareFixture).then(function (res) {
          should.exist(res.rideshares);
          res.rideshares.should.be.instanceof(Array);
          res.rideshares.length.should.equal(1);
        })
          .then(done, done);

      });

      it('should handle RPC response errors', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.resolve(JSON.stringify({
            jsonrpc: '2.0',
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            error: {
              code: 404,
              message: 'not_found',
              data: 'Rideshare not found.'
            }
          }));
        });

        rideshareUpdate(rideshareFixture).catch(function (err) {
          err.status.should.equal(404);
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

        rideshareUpdate(rideshareFixture).catch(function (err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);

      });

    });

  });


});
