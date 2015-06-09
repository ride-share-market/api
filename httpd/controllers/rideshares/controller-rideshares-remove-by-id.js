'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcRemoveRideshareById = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-remove-by-id'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function removeRideshareById(id) {

  assert.equal(typeof (id), 'string', 'argument id must be a string');

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcRemoveRideshareById(id).then(
    function rpcRemoveRideshareByIdSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function rpcRemoveRideshareByIdError(err) {
      // Return JSON-API error object
      metrics('controllers.rideshares.remove.error', Date.now());
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess() {
      metrics('controllers.rideshares.remove.resolve', Date.now());
      // TODO: Log the ID of the removed Rideshare
      //deferred.resolve({data: res});
      deferred.resolve({
        meta: {
          location: '/rideshares/user'
        }
      });
    },
    function jsonRpcResponseError(err) {
      metrics('controllers.rideshares.remove.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;

};
