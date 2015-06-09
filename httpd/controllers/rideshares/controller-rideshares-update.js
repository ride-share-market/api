'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcUpdateRideshare = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-update'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function updateRideshare(rideshare) {

  assert.equal(typeof (rideshare), 'object', 'argument rideshare must be an object');

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcUpdateRideshare(rideshare)
    .then(
    function (res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);

    },
    function (err) {
      // Return JSON-API error object
      metrics('controllers.rideshares.update.error', Date.now());
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function (res) {
      metrics('controllers.rideshares.update.resolve', Date.now());
      deferred.resolve({rideshares: [res]});
    },
    function (err) {
      metrics('controllers.rideshares.update.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
