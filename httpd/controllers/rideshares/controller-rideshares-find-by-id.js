'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcFindRideshareById = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-find-by-id'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function findAll(id) {

  assert.equal(typeof (id), 'string', 'argument string must be a string');

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcFindRideshareById(id)
    .then(
    function rpcFindRideshareByIdSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function rpcFindRideshareByIdError(err) {
      // Return JSON-API error object
      metrics('controllers.rideshares.find.byId.error', Date.now());
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      metrics('controllers.rideshares.find.byId.resolve', Date.now());
      deferred.resolve({rideshares: res});
    },
    function jsonRpcResponseError(err) {
      metrics('controllers.rideshares.find.byId.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
