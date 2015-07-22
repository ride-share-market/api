'use strict';

require('co-mocha');

var should = require('chai').should(),
  q = require('q'),
  sinon = require('sinon');

var config = require('./../../../config/app'),
  authController = require('./controller-auth-linkedin'),
  oauth2LinkedIn = require('oauth2-linkedin'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

describe('Controllers', function () {

  describe('Oauth', function () {

    describe('LinkedIn', function () {

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
      });

      describe('Fail', function() {

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
            return Promise.reject('Failed LinkedIn sign in.');
          });

          try {
            yield authController.linkedinCallback('abc123def456');
          }
          catch (e) {
            e.message.should.match(/failed/i);
          }

        });

        it('should handle RPC/database errors', function *() {

          sinon.stub(oauth2LinkedIn, 'getAccessToken', function () {
            return Promise.resolve({access_token: 'abc123'});
          });

          sinon.stub(oauth2LinkedIn, 'getProfile', function () {
            return Promise.resolve({
              emailAddress: 'net@citizen.com',
              firstName: 'Net',
              lastName: 'Citizen'
            });
          });

          // stub the database save operation with an error
          sinon.stub(rpcPublisher, 'publish', function () {
            return q.reject({code: 500, message: 'Service Unavailable'});
          });

          try {
            yield authController.linkedinCallback('abc123def456');
          }
          catch (e) {
            e.name.should.equal('Error');
            e.message.should.equal('Service Unavailable');
          }

        });

      });

      describe('Success', function() {

        it('should return a redirect URL', function *() {

          sinon.stub(oauth2LinkedIn, 'getAccessToken', function () {
            return Promise.resolve({access_token: 'abc123'});
          });

          sinon.stub(oauth2LinkedIn, 'getProfile', function () {
            return Promise.resolve({
              emailAddress: 'net@citizen.com',
              firstName: 'Net',
              lastName: 'Citizen'
            });
          });

          // stub the database save operation with a success
          sinon.stub(rpcPublisher, 'publish', function () {

            var result = JSON.stringify({
                result: {
                  _id: '5530c570a59afc0d00d9cfdc',
                  email: 'net@citizen.com',
                  currentProvider: 'linkedin',
                  providers: {
                    linkedin: {
                      emailAddress: 'net@citizen.com',
                      firstName: 'Net',
                      lastName: 'Citizen',
                      name:'Net Citizen'
                    }
                  }
                }
              }
            );

            return q.resolve(result);
          });

          try {
            var redirectUrl = yield authController.linkedinCallback('abc123def456');
            redirectUrl.should.match(/.*#!\/welcome\?jwt=.*/);
          }
          catch (e) {
            console.log('e', e.stack);
          }

        });

      });

    });

  });

});
