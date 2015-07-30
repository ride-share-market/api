'use strict';

var assert = require('assert');

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  oauthFacebook = require('oauth2-facebook'),
  rpcUserSignIn = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-signin'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

/**
 * Signin at facebook
 * Create or Update returned user with mongodb
 * Create JWT
 * Generate the redirect to app URL
 *
 * @param code Facebook Oauth code
 * @returns {string} URL - redirect to app URL
 */
exports.facebookCallback = function *facebookCallback(code, state) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');
  assert.equal(typeof (state), 'string', 'argument state must be a string');

  var metrics = timing(Date.now());

  try {

    // TODO validate state

    var oauthConfig = {
      appId: 'abc123',
      appSecret: 'secret',
      redirectUrl: {
        protocol: 'http://',
        host: 'example.com',
        uri: '/auth/facebook/callback'
      }
    };

    // 1
    // Perform Oauth steps
    var accessToken = yield oauthFacebook.getAccessToken(oauthConfig, code);
    var userProfile = yield oauthFacebook.getProfile(accessToken.accessToken);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('facebook', userProfile);

    // 3
    // Generate JWT token
    var token = jwtManager.issueToken({
      name: signedInUser.providers[signedInUser.currentProvider].name,
      id: signedInUser._id
    });

    var redirectUrl = [
      config.get('oauth').protocol,
      config.get('oauth').success.location,
      '?jwt=',
      token
    ].join('');

    logger.info({
        'action': 'signin',
        'provider': 'facebook',
        'token': token
      },
      redirectUrl);

    metrics('controllers.auth.resolve.resolve', Date.now());

    return redirectUrl;

  }
  catch (err) {

    logger.error(err);

    metrics('controllers.auth.facebook.error', Date.now());

    // RPC Error
    if (err.code && err.code === 500) {
      throw new Error(err.message);
    }

    throw new Error(err);
  }

};
