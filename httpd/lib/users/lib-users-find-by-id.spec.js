'use strict';

var should = require('chai').should(),
  fs = require('fs'),
  sinon = require('sinon'),
  q = require('q');

var config = require('./../../../config/app'),
  usersFindById = require('./lib-users-find-by-id'),
  rpcUserFind = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-find');

var userIdFixture = fs.readFileSync(config.get('root') + '/test/fixtures/user1_id.txt').toString();

describe('Lib', function () {
  describe('Users', function () {
    describe('Find By ID', function () {

      afterEach(function (done) {
        if (rpcUserFind.findById.restore) {
          rpcUserFind.findById.restore();
        }
        done();
      });

      it('should reject non valid user id input', function () {
        should.exist(usersFindById);
        usersFindById(101).catch(function (err) {
          err.should.match(/invalid/i);
        });

      });

      it('should find a valid user', function (done) {
        usersFindById(userIdFixture).then(function (res) {
          res.users._id.should.equal(userIdFixture);
        })
          .then(done, done);
      });

      it('should return 404 user not found', function (done) {
        usersFindById('5587df2c1192f413003ea752').catch(function (err) {
          err.status.should.equal(404);
        })
          .then(done, done);
      });

      it('should handle publish errors', function (done) {

        sinon.stub(rpcUserFind, 'findById', function () {
          return q.reject({
            code: 503,
            message: 'service_unavailable',
            data: 'Service Unavailable'
          });
        });

        usersFindById('542ecc5738cd267f52ac2084').catch(function (err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);
      });

    });
  });
});
