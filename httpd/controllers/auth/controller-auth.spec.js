'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2,
  FB = require('fb');

var config = require('./../../../config/app'),
  authController = require('./controller-auth'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

var googleAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-access-token.json').toString()),
  googleUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-user-profile.json').toString()),
  facebookAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-access-token.json').toString()),
  facebookUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-user-profile.json').toString());

describe('Controllers', function () {

  describe('Oauth', function () {

    afterEach(function () {
      // Restore sinon stubs
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
    });

    describe('Google', function() {

      afterEach(function () {
        // Restore sinon stubs
        if (OAuth2.prototype.getToken.restore) {
          OAuth2.prototype.getToken.restore();
        }
        if (google.plus.restore) {
          google.plus.restore();
        }
      });

      it('should handle missing required arguments', function *() {

        should.exist(authController.googleCallback);

        try {
          yield authController.googleCallback();
        }
        catch (e) {
          e.name.should.equal('AssertionError');
          e.message.should.match(/code.*string/);
        }

      });

      it('should handle Google Oauth Error', function *() {

        sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
          callback('invalid_grant');
        });

        try {
          yield authController.googleCallback('abc123');
        }
        catch (e) {
          e.name.should.equal('Error');
          e.message.should.equal('invalid_grant');
        }

      });

      describe('Google RPC processes', function () {

        beforeEach(function (done) {

          // 1st stub the Google Oauth process with a success result
          sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
            callback(null, googleAccessToken);
          });

          // Google plus user
          sinon.stub(google, 'plus').returns({
            people: {
              get: function (obj, callback) {
                callback(null, googleUserProfile);
              }
            }
          });

          done();

        });

        it('should handle database errors', function *() {

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.googleCallback('abc123');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

        it('should return a redirect URL', function *() {

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {

            var result = JSON.stringify({
                result: {
                  _id: 'xyzdef',
                  currentProvider: 'google',
                  providers: {
                    google: {
                      name: {
                        givenName: 'User'
                      }
                    }
                  }
                }
              }
            );

            return q.resolve(result);
          });

          var redirectUrl = yield authController.googleCallback('abc123');

          redirectUrl.should.match(/^http.*jwt=.*/);

        });

      });

    });

    describe('Facebook', function() {

      afterEach(function () {
        if (FB.api.restore) {
          FB.api.restore();
        }
      });

      describe('success', function() {

        beforeEach(function () {
          sinon.stub(FB, 'api', function (action, options, callback) {
            if (action === 'oauth/access_token') {
              callback(facebookAccessToken);
            }
            if (action === 'me') {
              callback(facebookUserProfile);
            }
          });
        });

        it('should return a redirect URL', function *() {

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {

            var result = JSON.stringify({
                result: {
                  _id: '5530c570a59afc0d00d9cfdc',
                  email: 'net@citizen.com',
                  currentProvider: 'facebook',
                  providers: {
                    facebook: {
                      name: 'Net Citizen'
                    }
                  }
                }
              }
            );

            return q.resolve(result);
          });

          var redirectUrl = yield authController.facebookCallback('abc123');

          redirectUrl.should.match(/^http.*jwt=.*/);

        });

        it('should handle database errors', function *() {

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.facebookCallback('abc123');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

      });

      describe('error', function() {

        it('should handle access_token request errors', function *() {

          sinon.stub(FB, 'api', function (action, options, callback) {
            if (action === 'oauth/access_token') {
              callback({error: 'oauth/access_token error occurred.'});
            }
          });

          try {
            yield yield authController.facebookCallback('abc123');
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
