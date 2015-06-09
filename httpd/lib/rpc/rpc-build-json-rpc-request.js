'use strict';

var assert = require('assert'),
  uuid = require('uuid');

module.exports = function buildJsonRpcRequest(methodParams) {

  assert.equal(typeof (methodParams), 'object', 'argument methodParams must be an object');
  assert.equal(typeof (methodParams.method), 'string', 'argument methodParams.method must be a string');
  assert.equal(typeof (methodParams.params), 'object', 'argument methodParams.params must be an object');

  var jsonRpc = {
    jsonrpc: '2.0',
    id: uuid.v4()
  };

  jsonRpc.method = methodParams.method;
  jsonRpc.params = methodParams.params;

  return JSON.stringify(jsonRpc);

};