'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  fs = require('fs'),
  FB = require('fb');

var config = require('./../../../config/app'),
  oauthFacebook = require('./lib-oauth-facebook');

var facebookAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-access-token.json').toString());
var facebookUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-user-profile.json').toString());

describe('Oauth', function () {

  describe('Facebook', function () {

    afterEach(function () {
      if (FB.api.restore) {
        FB.api.restore();
      }
    });

    it('should return a facebook user profile', function (done) {
      should.exist(oauthFacebook);

      sinon.stub(FB, 'api', function (action, options, callback) {
        if (action === 'oauth/access_token') {
          callback(facebookAccessToken);
        }
        if (action === 'me') {
          callback(facebookUserProfile);
        }
      });

      oauthFacebook('abc123').then(function (res) {
        res.id.should.equal(facebookUserProfile.id);
      })
        .then(done, done);

    });

    it('should handle access_token request errors', function(done) {

      sinon.stub(FB, 'api', function (action, options, callback) {
        if (action === 'oauth/access_token') {
          callback({error: 'oauth/access_token error occurred.'});
        }
      });

      oauthFacebook('abc123').catch(function (err) {
        err.should.equal('oauth/access_token error occurred.');
      })
        .then(done, done);

    });

  });

});
