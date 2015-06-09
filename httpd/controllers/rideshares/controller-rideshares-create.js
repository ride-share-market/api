'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcCreateRideshare = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-create'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function createRideshare(rideshare) {

  assert.equal(typeof (rideshare), 'object', 'argument rideshare must be an object');

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcCreateRideshare(rideshare)
    .then(
    function (res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);

    },
    function (err) {
      // Return JSON-API error object
      metrics('controllers.rideshares.create.error', Date.now());
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function (res) {
      metrics('controllers.rideshares.create.resolve', Date.now());
      deferred.resolve({rideshares: [res]});
    },
    function (err) {
      metrics('controllers.rideshares.create.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
