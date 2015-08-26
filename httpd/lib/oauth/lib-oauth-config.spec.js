'use strict';

var should = require('chai').should();

var config = require('./../../../config/app'),
  oauthConfig = require('./lib-oauth-config');

describe('Oauth', function () {

  describe('Config', function () {

    it('should get oauth configs', function () {

      should.exist(oauthConfig);

      var google = oauthConfig.get(config.get('oauth'), 'google');
      google.redirectUrl.uri.should.equal('/auth/google/callback');

      var facebook = oauthConfig.get(config.get('oauth'), 'facebook');
      facebook.redirectUrl.uri.should.equal('/auth/facebook/callback');

      var linkedin = oauthConfig.get(config.get('oauth'), 'linkedin');
      linkedin.redirectUrl.uri.should.equal('/auth/linkedin/callback');

    });

  });

});
