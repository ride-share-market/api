'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcUserSignIn = require('./rpc-users-signin');

var googleUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/google-user-profile.json').toString()),
  facebookUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/facebook-user-profile.json').toString()),
  linkedUserProfile = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/oauth/linkedin-user-profile.json').toString());

describe('RPC User Sign In', function () {

  afterEach(function () {
    if (rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
  });

  describe('Google', function () {

    it('should publish a JSON-RPC user.signin message and return the result', function (done) {

      should.exist(rpcUserSignIn);

      sinon.stub(rpcPublisher, 'publish', function (json) {
        var jsonRpc = JSON.parse(json);

        jsonRpc.jsonrpc.should.equal('2.0');
        (typeof (jsonRpc.id)).should.be.a('string');
        jsonRpc.method.should.equal('user.signIn');
        jsonRpc.params.should.be.an('object');

        var result = JSON.stringify({
            result: {
              email: googleUserProfile.emails[0].value
            }
          }
        );

        return q.resolve(result);
      });

      rpcUserSignIn('google', googleUserProfile).then(function rpcUserSignInSuccess(res) {
        res.email.should.equal(googleUserProfile.emails[0].value);
      })
        .then(done, done);

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 500, message: 'Service Unavailable'});
      });

      rpcUserSignIn('google', googleUserProfile).catch(function rpcUserSignInError(err) {
        err.code.should.equal(500);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

  describe('FaceBook', function () {

    it('should publish a JSON-RPC user.signin message and return the result', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        var result = JSON.stringify({
            result: {
              email: facebookUserProfile.email
            }
          }
        );
        return q.resolve(result);
      });

      rpcUserSignIn('facebook', facebookUserProfile).then(function rpcUserSignInSuccess(res) {
        res.email.should.equal(facebookUserProfile.email);
      })
        .then(done, done);

    });

  });

  describe('LinkedIn', function () {

    it('should publish a JSON-RPC user.signin message and return the result', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        var result = JSON.stringify({
            result: {
              email: linkedUserProfile.emailAddress
            }
          }
        );
        return q.resolve(result);
      });

      rpcUserSignIn('linkedin', linkedUserProfile).then(function rpcUserSignInSuccess(res) {
        res.email.should.equal(linkedUserProfile.emailAddress);
      })
        .then(done, done);

    });

  });

});
