'use strict';

var assert = require('assert');

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  oauth2LinkedIn = require('oauth2-linkedin'),
  rpcUserSignIn = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-signin'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager'),
  timing = require(config.get('root') + '/httpd/lib/metrics/timing');

/**
 * Get a valid oauth2 access token from linkedin with the received oauth2 code
 *
 * Create or Update returned user with mongodb
 * Create JWT
 * Generate the redirect to app URL
 *
 * @param code Linkedin Oauth code
 * @returns {string} URL - redirect to app URL
 */
exports.linkedinCallback = function *linkedinCallback(code, state) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');
  assert.equal(typeof (state), 'string', 'argument state must be a string');

  var metrics = timing(Date.now());

  var oauth = config.get('oauth');

  var oauthConfig = {
    clientId: oauth.providers.linkedin.clientId,
    clientSecret: oauth.providers.linkedin.clientSecret,
    redirectUrl: {
      protocol: oauth.protocol,
      host: oauth.host,
      uri: oauth.providers.linkedin.redirectUri
    }
  };

  try {

    // TODO validate state, test for possible CSRF attack

    // 1
    // Perform Oauth steps
    var oAuthAccessToken = yield oauth2LinkedIn.getAccessToken(oauthConfig, logger.error.bind(logger), code);

    var oAuthUserProfile = yield oauth2LinkedIn.getProfile(logger.error.bind(logger), oAuthAccessToken.access_token);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('linkedin', oAuthUserProfile);

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
        'provider': 'linkedin',
        'token': token
      },
      redirectUrl);

    metrics('controllers.auth.resolve.resolve', Date.now());

    return redirectUrl;

  }
  catch (err) {

    logger.error(err);

    metrics('controllers.auth.linkedin.error', Date.now());

    // RPC Error
    if (err.code && err.code === 500) {
      throw new Error(err.message);
    }

    throw new Error(err);
  }

};
