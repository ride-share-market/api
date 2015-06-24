'use strict';

var assert = require('chai').assert,
  co = require('co'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcUserFind = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-find'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response'),
  formatUserResponse = require(config.get('root') + '/httpd/lib/users/format-user-response'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

module.exports = function (userId) {
  return co(function *() {
    return yield validateUserId(userId).then(userFindById);
  });
};

function validateUserId(userId) {
  if(!/^[0-9a-fA-F]{24}$/.test(userId)) {
    return Promise.reject('Invalid User ID: ' + userId);
  }
  return Promise.resolve(userId);
}

function userFindById(userId) {

  var metrics = timing(Date.now()),
    deferred = q.defer();

  rpcUserFind.findById(userId)
    .then(
    function findUserByIdSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function findByIdError(err) {
      // Return JSON-API error object
      metrics('lib.users.find.byId.error', Date.now());
      return q.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      metrics('lib.users.find.byId.resolve', Date.now());
      deferred.resolve({users: formatUserResponse(res)});
    },
    function jsonRpcResponseError(err) {
      metrics('lib.users.find.byId.reject', Date.now());
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;

}
