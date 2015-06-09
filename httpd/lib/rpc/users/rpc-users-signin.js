'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcBuildJsonRpcRequest = require(config.get('root') + '/httpd/lib/rpc/rpc-build-json-rpc-request'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

module.exports = function rpcUserSignIn(provider, oAuthUser) {

  assert.equal(typeof (provider), 'string', 'argument \'provider\' must be a string');
  assert.equal(typeof (oAuthUser), 'object', 'argument \'oAuthUser\' must be an object');

  var deferred = q.defer();

  // Currently Google Plus only
  //var user = {
  //  email: oAuthUser.emails[0].value,
  //  provider: provider,
  //  profile: oAuthUser
  //};

  var userFilter = {
    google: function(oAuthUser) {
      return {
        email: oAuthUser.emails[0].value,
        provider: provider,
        profile: oAuthUser
      };
    },
    facebook: function(oAuthUser) {
      return {
        email: oAuthUser.email,
        provider: provider,
        profile: oAuthUser
      };
    }

  };

  var user = userFilter[provider](oAuthUser);

  var jsonRpcMessage = rpcBuildJsonRpcRequest({
    method: 'user.signIn',
    params: user
  });

  rpcPublisher.publish(jsonRpcMessage)
    .then(function publishSuccess(res) {
      var rpcPublishObj = JSON.parse(res);
      deferred.resolve(rpcPublishObj.result);
    })
    .catch(function publishError(err) {
      deferred.reject(err);
    })
    .done();


  return deferred.promise;
};
