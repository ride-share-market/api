'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

var config = require('./../../../config/app'),
  authController = require('./controller-auth'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

var googleAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-access-token.json').toString()),
  googleUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-user-profile.json').toString());

describe('Controllers', function () {

  describe('Oauth', function () {

    afterEach(function () {
      // Restore sinon stubs
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
    });

    describe('Google', function () {

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

  });

});
