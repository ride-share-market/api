'use strict';

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  googleSignIn = require('oauth2-google').signIn,
  oauthConfig = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-config'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state'),
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth-google');

module.exports = function (router) {

  router.get('/signin/google', function *signinGoogle(next) {

    var googleOauthConfig = oauthConfig.get(config.get('oauth'), 'google');

    var signIn = googleSignIn(googleOauthConfig);

    // Save state for CSRF attack prevention
    yield oauthState.upsert(signIn.state);

    this.redirect(signIn.url);

    yield next;

  });

  router.get('/auth/google/callback', function *(next) {

    var redirectUrl;

    try {

      if (this.query.error && this.query.error === 'access_denied') {

        // TODO: The app needs to handle the error url param, currently it's a generic error page for everything
        // http://api01.dev.loc.ridesharemarket.com:3001/auth/google/callback?error=access_denied
        redirectUrl = [
          config.get('oauth').protocol,
          config.get('oauth').error.location,
          '?error=access_denied'
        ].join('');

      }
      else if (this.query.code) {
        redirectUrl = yield authController.googleCallback(this.query.code, this.query.state);
      }
      else {

        // Example:
        // http://api01.dev.loc.ridesharemarket.com:3001/auth/google/callback?error=other

        logger.error(this.url);

        redirectUrl = [
          config.get('oauth').protocol,
          config.get('oauth').error.location
        ].join('');
      }
    }
    catch (err) {

      logger.error(err);

      redirectUrl = [
        config.get('oauth').protocol,
        config.get('oauth').error.location
      ].join('');
    }

    this.redirect(redirectUrl);

    yield next;

  });

};
