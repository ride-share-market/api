'use strict';

require('co-mocha');

var should = require('chai').should(),
  q = require('q'),
  fs = require('fs'),
  sinon = require('sinon');

var config = require('./../../../config/app'),
  authController = require('./controller-auth-linkedin'),
  oauth2LinkedIn = require('oauth2-linkedin'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  oauthState = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-state'),
  fixtureLinkedinUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/linkedin-user-profile.json').toString()),
  fixtureRpcUserSignIn = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response-rpc-user-signIn.json').toString());

describe('Controllers', function () {

  describe('Auth', function () {

    describe('LinkedIn', function () {

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
        if (oauth2LinkedIn.getAccessToken.restore) {
          oauth2LinkedIn.getAccessToken.restore();
        }

        if (oauth2LinkedIn.getProfile.restore) {
          oauth2LinkedIn.getProfile.restore();
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

      describe('Fail', function () {

        it('should handle missing required arguments', function *() {

          should.exist(authController.linkedinCallback);

          try {
            yield authController.linkedinCallback();
          }
          catch (e) {
            e.name.should.equal('AssertionError');
            e.message.should.match(/code.*string/);
          }

        });

        it('should handle oauth errors', function *() {

          sinon.stub(oauth2LinkedIn, 'getAccessToken', function () {
            return q.reject('Failed LinkedIn sign in.');
          });

          try {
            yield authController.linkedinCallback('abc123def456', 'zyx789');
          }
          catch (e) {
            e.message.should.match(/failed/i);
          }

        });

        it('should handle RPC/database errors', function *() {

          sinon.stub(oauth2LinkedIn, 'getAccessToken', function () {
            return q.resolve({access_token: 'abc123'});
          });

          sinon.stub(oauth2LinkedIn, 'getProfile', function () {
            return q.resolve(fixtureLinkedinUserProfile);
          });

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.linkedinCallback('abc123def456', 'xyz789');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

      });

      describe('Success', function () {

        it('should return a redirect URL', function *() {

          sinon.stub(oauth2LinkedIn, 'getAccessToken', function () {
            return Promise.resolve({access_token: 'abc123'});
          });

          sinon.stub(oauth2LinkedIn, 'getProfile', function () {
            return q.resolve(fixtureLinkedinUserProfile);
          });

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {

            var result = JSON.stringify(fixtureRpcUserSignIn);

            return q.resolve(result);
          });

          var redirectUrl = yield authController.linkedinCallback('abc123def456', 'xyz789');

          redirectUrl.should.match(/.*#!\/welcome\?jwt=.*/);

        });

      });

    });

  });

});
