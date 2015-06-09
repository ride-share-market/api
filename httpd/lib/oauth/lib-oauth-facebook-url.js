'use strict';

var config = require('./../../../config/app');

module.exports = function () {

  var redirectUri = [
    config.get('oauth').protocol,
    config.get('oauth').redirectUrl.location,
    config.get('oauth').providers.facebook.redirectUri
  ].join('');


  //TODO add 'state' for anti cross site scripting
  //https://www.facebook.com/dialog/oauth?scope=public_profile,email&state=abc123abc123&client_id=1554247134804120&redirect_uri=http://local.ridesharemarket.com:3001/auth/facebook/callback

  return config.get('oauth').providers.facebook.url +
    '?scope=' + config.get('oauth').providers.facebook.scope +
    '&client_id=' + config.get('oauth').providers.facebook.appId +
    '&redirect_uri=' + redirectUri;
};
