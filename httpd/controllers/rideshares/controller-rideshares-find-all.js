'use strict';

var q = require('q');

var config = require('./../../../config/app'),
  rpcFindAllRideshares = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-find-all'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function findAll() {

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcFindAllRideshares()
    .then(
    function rpcFindAllRidesharesSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function rpcFindAllRidesharesError(err) {
      // Return JSON-API error object
      metrics('controllers.rideshares.find.all.error', Date.now());
      return q.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      metrics('controllers.rideshares.find.all.resolve', Date.now());
      deferred.resolve({rideshares: res});
    },
    function jsonRpcResponseError(err) {
      metrics('controllers.rideshares.find.all.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
