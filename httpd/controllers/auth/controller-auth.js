'use strict';

var assert = require('assert');

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  oauthGoogle = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-google'),
  oauthFacebook = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-facebook'),
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
exports.googleCallback = function *googleCallback(code) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');

  var metrics = timing(Date.now());

  try {

    // 1
    // Perform Oauth steps
    var oAuthUser = yield oauthGoogle(code);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('google', oAuthUser);

    // 3
    // Generate JWT token
    var token = jwtManager.issueToken({
      name: signedInUser.providers[signedInUser.currentProvider].name.givenName,
      id: signedInUser._id
    });

    var redirectUrl = [
      config.get('oauth').protocol,
      config.get('oauth').success.location,
      '?jwt=',
      token
    ].join('');

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


/**
 * Signin at facebook
 * Create or Update returned user with mongodb
 * Create JWT
 * Generate the redirect to app URL
 *
 * @param code Facebook Oauth code
 * @returns {string} URL - redirect to app URL
 */
exports.facebookCallback = function *facebookCallback(code) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');

  var metrics = timing(Date.now());

  try {

    // 1
    // Perform Oauth steps
    var oAuthUser = yield oauthFacebook(code);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('facebook', oAuthUser);

    // 3
    // Generate JWT token
    var token = jwtManager.issueToken({
      //name: signedInUser.providers[signedInUser.currentProvider].name.givenName,
      name: signedInUser.providers[signedInUser.currentProvider].name,
      id: signedInUser._id
    });

    var redirectUrl = [
      config.get('oauth').protocol,
      config.get('oauth').success.location,
      '?jwt=',
      token
    ].join('');

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