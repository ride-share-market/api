'use strict';

var should = require('chai').should();

var rpcBuildJsonRpcRequest = require('./rpc-build-json-rpc-request');

describe('RPC Build JSON RPC Request', function() {

  it('should return JSON RPC request string', function(done) {

    should.exist(rpcBuildJsonRpcRequest);

    var jsonRpc = rpcBuildJsonRpcRequest({
      method: 'user.findById',
      params: {
        email: 'net@citizen.com'
      }
    });

    jsonRpc.should.match(/"jsonrpc":"2\.0","id":".*","method":"user\.findById","params":{"email":"net@citizen\.com"}}/);
    done();
  });

});
