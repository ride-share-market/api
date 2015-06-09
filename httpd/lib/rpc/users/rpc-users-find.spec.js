'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcUserFind = require('./rpc-users-find');

describe('RPC User Find', function () {

  afterEach(function(done) {
    if(rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  describe('Find By ID', function () {

    it('should publish a JSON-RPC user.findById message and return the result', function (done) {

      should.exist(rpcUserFind);

      sinon.stub(rpcPublisher, 'publish', function (json) {
        var jsonRpc = JSON.parse(json);

        jsonRpc.jsonrpc.should.equal('2.0');
        (typeof (jsonRpc.id)).should.be.a('string');
        jsonRpc.method.should.equal('user.findById');
        jsonRpc.params.id.should.equal('abc123');

        return q.resolve('{"result": "OK"}');
      });

      rpcUserFind.findById('abc123').then(function findByIdSuccess(res) {
        res.result.should.equal('OK');
      })
        .then(done, done);
    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 503, message: 'Service Unavailable'});
      });

      rpcUserFind.findById('abc123').catch(function findByIdError(err) {
        err.code.should.equal(503);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

});
