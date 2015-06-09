'use strict';

var should = require('chai').should();

var rpcPublisher = require('./rpc-publisher');

describe('RPC Publisher', function () {

  it('should export an amqp-rpc-factory publisher', function (done) {
    should.exist(rpcPublisher);
    (typeof (rpcPublisher)).should.equal('object');
    (typeof (rpcPublisher.publish)).should.equal('function');
    done();
  });

});
