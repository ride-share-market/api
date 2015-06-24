'use strict';

var should = require('chai').should(),
  assert = require('chai').assert,
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('./../../../config/app'),
  rpcUserFind = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-find'),
  user = require('./controller-users-find');

var userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user1_id.txt').toString();


describe('Controllers', function () {

  describe('Users', function () {

    describe('Find By ID', function () {

      afterEach(function (done) {
        if (rpcUserFind.findById.restore) {
          rpcUserFind.findById.restore();
        }
        done();
      });

      it('should reject invalid user ID', function (done) {
        user.findById('abc123').catch(function findByIdError(err) {
          should.exist(err);
          err.status.should.equal(400);
          assert.isArray(err.errors, 'Top level response property should be an Array');
          err.errors[0].code.should.equal('invalid_format');
          err.errors[0].title.should.equal('Invalid user ID format.');
        })
          .then(done, done);
      });

      it('should handle user not found', function (done) {

        user.findById('242ecc5738cd267f52ac2084').catch(function findByIdError(err) {
          err.status.should.equal(404);
          assert.isArray(err.errors, 'Top level response property should be an Array');
          err.errors[0].code.should.equal('not_found');
          err.errors[0].title.should.equal('Account profile not found.');
        })
          .then(done, done);
      });

      it('should return a user found by ID', function (done) {

        user.findById(userIdFixture).then(function findByIdSuccess(res) {
          res.users._id.should.equal(userIdFixture);
          res.users.providers.should.be.instanceof(Array);
        })
          .then(done, done);

      });

      it('should handle publish errors', function(done) {

        sinon.stub(rpcUserFind, 'findById', function () {
          return q.reject({
            code: 503,
            message: 'service_unavailable',
            data: 'Service Unavailable'
          });
        });

        user.findById('542ecc5738cd267f52ac2084').catch(function findByIdError(err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);
      });

    });

  });

});
