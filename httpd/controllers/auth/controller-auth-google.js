'use strict';

var assert = require('assert');

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  oauthGoogle = require('oauth2-google'),
  oauthConfig = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-config'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state'),
  rpcUserSignIn = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-signin'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

/**
 * Signin at google
 * Create or Update returned user with mongodb
 * Create JWT
 * Generate the redirect to app URL
 *
 * @param code Google Oauth access_code
 * @returns {string} URL - redirect to app URL
 */
exports.googleCallback = function *googleCallback(code, state) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');
  assert.equal(typeof (state), 'string', 'argument state must be a string');

  var metrics = timing(Date.now());

  var googleOauthConfig = oauthConfig.get(config.get('oauth'), 'google');

  try {

    // Validate state - test for possible CSRF attack
    var stateToken = yield oauthState.get(state);
    yield oauthState.isValid(stateToken);
    yield oauthState.remove(state);

    // 1
    // Perform Oauth steps
    var accessTokens = yield oauthGoogle.getAccessTokens(googleOauthConfig, code);
    var userProfile = yield oauthGoogle.getProfile(googleOauthConfig, accessTokens);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('google', userProfile);

    // 3
    // Generate JWT token
    var token = jwtManager.issueToken({
      name: signedInUser.providers[signedInUser.currentProvider].displayName,
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
        'provider': 'google',
        'token': token
      },
      redirectUrl);

    metrics('controllers.auth.google.resolve', Date.now());

    return redirectUrl;

  }
  catch (err) {

    logger.error(err);

    metrics('controllers.auth.google.error', Date.now());

    // RPC Error
    if (err.code && err.code === 500) {
      throw new Error(err.message);
    }

    throw new Error(err);
  }

};
