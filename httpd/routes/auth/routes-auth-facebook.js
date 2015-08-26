'use strict';

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),

  facebookSignIn = require('oauth2-facebook').signIn,
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth-facebook'),
  oauthConfig = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-config'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state');

module.exports = function (router) {

  router.get('/signin/facebook', function *signinFacebook(next) {

    var facebookOauthConfig = oauthConfig.get(config.get('oauth'), 'facebook');

    var signIn = facebookSignIn(facebookOauthConfig);

    // Save state for CSRF attack prevention
    yield oauthState.upsert(signIn.state);

    this.redirect(signIn.url);

    yield next;

  });

  router.get('/auth/facebook/callback', function *(next) {

    var redirectUrl;

    try {

      if(this.query.error && this.query.error === 'access_denied') {

        // TODO: The app needs to handle the error url param, currently it's a generic error page for everything
        // http://api01.dev.loc.ridesharemarket.com:3001/auth/google/callback?error=access_denied
        redirectUrl = [
          config.get('oauth').protocol,
          config.get('oauth').error.location,
          '?error=access_denied'
        ].join('');

      }
      else if (this.query.code && this.query.state) {
        redirectUrl = yield authController.facebookCallback(this.query.code, this.query.state);
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
