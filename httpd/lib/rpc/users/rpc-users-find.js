'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcBuildJsonRpcRequest = require(config.get('root') + '/httpd/lib/rpc/rpc-build-json-rpc-request'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

exports.findById = function findById(id) {

  assert.equal(typeof (id), 'string', 'argument \'id\' must be a string');

  var deferred = q.defer();

  var jsonRpcMessage = rpcBuildJsonRpcRequest({
    method: 'user.findById',
    params: {
      id: id
    }
  });

  rpcPublisher.publish(jsonRpcMessage)
    .then(function publishSuccess(jsonRpc) {
      var res = JSON.parse(jsonRpc);
      deferred.resolve(res);
    })
    .catch(function publishError(err) {
      deferred.reject(err);
    })
    .done();


  return deferred.promise;
};
