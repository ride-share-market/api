'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  authController = require('./controller-auth-facebook');

var oauthFacebook = require('oauth2-facebook'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state');

var fixtureFacebookAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-access-token.json').toString()),
  fixtureFacebookUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-user-profile.json').toString()),
  fixtureRpcUserSignIn = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response-rpc-user-signIn.json').toString());

describe('Controllers', function () {

  describe('Auth', function () {

    describe('Facebook', function () {

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
        if (oauthFacebook.getAccessToken.restore) {
          oauthFacebook.getAccessToken.restore();
        }
        if (oauthFacebook.getProfile.restore) {
          oauthFacebook.getProfile.restore();
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
          sinon.stub(oauthFacebook, 'getAccessToken', function () {
            return q.resolve(fixtureFacebookAccessToken);
          });
          sinon.stub(oauthFacebook, 'getProfile', function () {
            return q.resolve(fixtureFacebookUserProfile);
          });
        });

        it('should return a redirect URL', function *() {

          should.exist(authController);

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.resolve(JSON.stringify(fixtureRpcUserSignIn));
          });

          var redirectUrl = yield authController.facebookCallback('code', 'state');

          redirectUrl.should.match(/^http.*jwt=.*/);

        });

        it('should handle RPC errors', function *() {

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.facebookCallback('code', 'state');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

      });

      describe('error', function () {

        it('should handle access_token request errors', function *() {

          sinon.stub(oauthFacebook, 'getAccessToken', function () {
            return q.reject('oauth/access_token error occurred.');
          });

          try {
            yield authController.facebookCallback('code', 'state');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('oauth/access_token error occurred.');
          }

        });

      });

    });

  });

});
