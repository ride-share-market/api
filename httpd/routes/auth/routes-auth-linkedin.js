'use strict';

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  linkedinSignInUrl = require('oauth2-linkedin').signInUrl,
  authController = require(config.get('root') + '/httpd/controllers/auth/controller-auth-linkedin');

module.exports = function (router) {

  router.get('/signin/linkedin', function *signinLinkedin(next) {

    var oauth = config.get('oauth');

    var oauthConfig = {
      clientId: oauth.providers.linkedin.clientId,
      redirectUrl: {
        protocol: oauth.protocol,
        host: oauth.host,
        uri: oauth.providers.linkedin.redirectUri
      }
    };

    this.redirect(linkedinSignInUrl(oauthConfig));

    yield next;

  });

  router.get('/auth/linkedin/callback', function *(next) {

    var redirectUrl;

    try {

      if(this.query.error && this.query.error === 'access_denied') {

        // TODO: The angular app needs to handle ?error=access_denied, currently it's a generic error page for everything
        redirectUrl = [
          config.get('oauth').protocol,
          config.get('oauth').error.location,
          '?error=access_denied'
        ].join('');

      }
      else if (this.query.code) {
        redirectUrl = yield authController.linkedinCallback(this.query.code);
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