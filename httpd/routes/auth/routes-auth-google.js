'use strict';

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  googleSignInUrl = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-google-url')(),
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth');

//module.exports = function (app) {
module.exports = function (router) {

  router.get('/signin/google', function *signinGoogle(next) {
    this.redirect(googleSignInUrl);
    yield next;
  });

  router.get('/auth/google/callback', function *(next) {

    /*
     signin at google
     register returned user.email with mongodb
     create jwt
     redirect to app
     */

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
      else if (this.query.code) {
        redirectUrl = yield authController.googleCallback(this.query.code);
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
