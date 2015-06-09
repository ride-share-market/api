'use strict';

var q = require('q');

var config = require('../../../../config/app'),
  rpcBuildJsonRpcRequest = require(config.get('root') + '/httpd/lib/rpc/rpc-build-json-rpc-request'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

module.exports = function findAll() {

  var deferred = q.defer();

  var jsonRpcMessage = rpcBuildJsonRpcRequest({
    method: 'rideshare.findAll',
    params: {
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