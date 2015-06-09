'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  ridesharesRemoveById = require('./controller-rideshares-remove-by-id');

describe('Controllers', function () {

  describe('Rideshares', function () {

    describe('Remove By ID', function () {

      afterEach(function (done) {
        if (rpcPublisher.publish.restore) {
          rpcPublisher.publish.restore();
        }
        done();
      });

      it('should return 404 for an unknown Rideshare', function (done) {

        ridesharesRemoveById('546b769c7c5ae961209cd547').catch(function ridesharesRemoveByIdError(err) {
          should.exist(err);
          err.status.should.equal(404);
          err.errors[0].code.should.equal('not_found');
          err.errors[0].title.should.equal('Rideshare not found.');
        })
          .then(done, done);

      });

      it('should handle RPC connections errors', function (done) {

        sinon.stub(rpcPublisher, 'publish', function () {
          return q.reject({
            code: 503,
            message: 'service_unavailable',
            data: 'Service Unavailable'
          });
        });

        ridesharesRemoveById('546b769c7c5ae961209cd547').catch(function ridesharesRemoveByIdError(err) {
          err.status.should.equal(503);
          err.errors[0].code.should.equal('service_unavailable');
          err.errors[0].title.should.equal('Service Unavailable');
        })
          .then(done, done);

      });

    });

  });


});
