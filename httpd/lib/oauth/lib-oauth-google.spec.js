'use strict';

var sinon = require('sinon'),
  should = require('chai').should(),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

// http://blakeembrey.com/articles/mocha-test-harmony-generators/
// https://github.com/blakeembrey/co-mocha
//require('co-mocha');

var oauthGoogle = require('./lib-oauth-google');

// Google Oauth response for code/token exchange request
var getOauthTokenTokens = {
  access_token: 'ya29.cgBOAwcobnnB_iEAAACkeFP2kwCfkDjdefR0Utqn4ln0dNgWO546IatEMyFui3KNgeCg6gBWr8yKomYkT_X',
  token_type: 'Bearer',
  id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRmNGNmZGQzMmYwYmI4Zjg4N2EwNDBhMGJhYTdjODUxYjhmOTViMzcifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWQiOiIxMDk1MTE5NjI3MjY3MTk1NTM2MTIiLCJzdWIiOiIxMDk1MTE5NjI3MjY3MTk1NTM2MTIiLCJhenAiOiIxMDE1OTc4ODI5OTA5LWRqYzJsamZtZTVyNG1ucWQ0Y28zODBtbm1uODlhZnBtLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJvb2x5Lm1lQGdtYWlsLmNvbSIsImF0X2hhc2giOiJ2cFBpWDljZ1NwNzJoUG5fZFhlbEhBIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6IjEwMTU5Nzg4Mjk5MDktZGpjMmxqZm1lNXI0bW5xZDRjbzM4MG1ubW44OWFmcG0uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJ0b2tlbl9oYXNoIjoidnBQaVg5Y2dTcDcyaFBuX2RYZWxIQSIsInZlcmlmaWVkX2VtYWlsIjp0cnVlLCJjaWQiOiIxMDE1OTc4ODI5OTA5LWRqYzJsamZtZTVyNG1ucWQ0Y28zODBtbm1uODlhZnBtLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaWF0IjoxNDA5NDk3OTY1LCJleHAiOjE0MDk1MDE4NjV9.DjT7VxG-2rU7GQ1ycobvl3hp19AP9dS8uqqKHWAtvKdnhQfT3mK5PCYwrFsLgBpbtf_vR3fa1c0t9ZnFrkGgPUrH7kiSg0s9e7PoBsN2z39gbn9X4Blc4Y0NvS-CWFINJuxl3KYURIY2u1n2bMFcJFD2kFi34re8a4FKY9YV_rs',
  expiry_date: 1409501865230
};

describe('Oauth', function () {

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

    describe('reject', function () {

      it('should reject missing oauth code', function (done) {

        return oauthGoogle()
          .catch(function (err) {
            err.should.equal('Missing require Oauth Code');
          })
          .then(done, done);

      });

      it('should reject invalid oauth code', function (done) {

        return oauthGoogle()
          .catch(function (err) {
            err.should.equal('Missing require Oauth Code');
          })
          .then(done, done);

      });

      it('should handle get Oauth Token rejection', function (done) {

        sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
          callback('invalid_grant');
        });

        return oauthGoogle('abc123abc123abc123abc123abc123abc123')
          .catch(function (err) {
            err.should.equal('invalid_grant');
          })
          .then(done, done);

      });

      it('should handle get Google Plus User errors', function (done) {

        sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
          callback(null, getOauthTokenTokens);
        });

        // Google error response
        var googleErrorResponse = {
          errors: [
            {
              domain: 'global',
              reason: 'authError',
              message: 'Invalid Credentials',
              locationType: 'header',
              location: 'Authorization'
            }],
          code: 401,
          message: 'Invalid Credentials'
        };

        sinon.stub(google, 'plus').returns({
          people: {
            get: function (obj, callback) {
              callback(googleErrorResponse);
            }
          }
        });

        return oauthGoogle('abc123abc123abc123abc123abc123abc123')
          .catch(function (err) {
            err.should.equal(googleErrorResponse);
          })
          .then(done, done);

      });

    });

    describe('accept', function () {

      it('should return a google plus user object', function (done) {

        sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
          callback(null, getOauthTokenTokens);
        });

        // Google plus user
        var user = {
          kind: 'plus#person',
          etag: '"pNz5TVTpPz2Rn5Xw8UrubkkbOJ0/8wII0zxjh6EMZTkJA--p6DSI-wX"',
          gender: 'male',
          emails: [{value: 'net@citizen.com', type: 'account'}],
          objectType: 'person',
          id: '109515962716719253613',
          displayName: 'Net Citizen',
          name: {familyName: 'Citizen', givenName: 'Net'},
          url: 'https://plus.google.com/109511962727719553613',
          image: {
            url: 'https://lh3.googleusercontent.com/-eLAFwuSEM2x/AAAAAAAAAAI/AAAAAAAAACg/dWlcwoWU533/photo.jpg?sz=50',
            isDefault: false
          },
          isPlusUser: true,
          circledByCount: 8,
          verified: false
        };

        sinon.stub(google, 'plus').returns({
          people: {
            get: function (obj, callback) {
              callback(null, user);
            }
          }
        });

        return oauthGoogle('abc123abc123abc123abc123abc123abc123')
          .then(function (res) {
            should.exist(res);
            res.should.equal(user);
          })
          .then(done, done);

      });

    });

  });

});
