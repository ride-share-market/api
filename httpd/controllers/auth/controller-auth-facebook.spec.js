'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs'),
  FB = require('fb');

var config = require('./../../../config/app'),
  authController = require('./controller-auth-facebook'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

var facebookAccessToken = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-access-token.json').toString()),
  facebookUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-user-profile.json').toString());

describe('Controllers', function () {

  describe('Auth', function () {

    describe('Facebook', function () {

      afterEach(function () {
        if (FB.api.restore) {
          FB.api.restore();
        }
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
      });

      describe('success', function () {

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

          should.exist(authController);

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

          var redirectUrl = yield authController.facebookCallback('code', 'state');

          redirectUrl.should.match(/^http.*jwt=.*/);

        });

        it('should handle database errors', function *() {

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

          sinon.stub(FB, 'api', function (action, options, callback) {
            callback({error: 'oauth/access_token error occurred.'});
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
