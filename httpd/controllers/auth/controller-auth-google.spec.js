'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  authController = require('./controller-auth-google'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

var fixtureGoogleAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-access-token.json').toString()),
  fixtureGoogleUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-user-profile.json').toString()),
  fixtureRpcUserSignIn = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response-rpc-user-signIn.json').toString());

var oauthGoogle = require('oauth2-google');

describe('Controllers', function () {

  describe('Auth', function () {

    describe('Google', function () {

      beforeEach(function() {

        sinon.stub(oauthState, 'get', function() {
          return q.resolve({
            created_at: 1439816401105,
            expires_at: 1439816521105
          });
        });

        sinon.stub(oauthState, 'isValid', function() {
          return q.resolve('Valid oauth state token');
        });

        sinon.stub(oauthState, 'remove', function() {
          return q.resolve(true);
        });

      });

      afterEach(function () {
        if (oauthGoogle.getAccessTokens.restore) {
          oauthGoogle.getAccessTokens.restore();
        }
        if (oauthGoogle.getProfile.restore) {
          oauthGoogle.getProfile.restore();
        }
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        if (oauthState.get.restore) {
          oauthState.get.restore();
        }
        if (oauthState.isValid.restore) {
          oauthState.isValid.restore();
        }
        if (oauthState.remove.restore) {
          oauthState.remove.restore();
        }
      });

      describe('success', function () {

        beforeEach(function () {
          sinon.stub(oauthGoogle, 'getAccessTokens', function () {
            return q.resolve(fixtureGoogleAccessToken);
          });
          sinon.stub(oauthGoogle, 'getProfile', function () {
            return q.resolve(fixtureGoogleUserProfile);
          });
        });

        it('should return a redirect URL', function *() {

          should.exist(authController);

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.resolve(JSON.stringify(fixtureRpcUserSignIn));
          });

          var redirectUrl = yield authController.googleCallback('code', 'state');

          redirectUrl.should.match(/^http.*jwt=.*/);

        });

        it('should handle RPC errors', function *() {

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.googleCallback('code', 'state');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

      });

      describe('error', function () {

        it('should handle access_token request errors', function *() {

          sinon.stub(oauthGoogle, 'getAccessTokens', function () {
            return q.reject('invalid_grant');
          });

          try {
            yield authController.googleCallback('code', 'state');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('invalid_grant');
          }

        });

      });

    });

  });

});
