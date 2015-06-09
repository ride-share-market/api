'use strict';

var should = require('chai').should(),
  assert = require('chai').assert;

var jsonRpcResponse = require('./rpc-json-rpc-response');

describe('RPC Resolve JSON RPC Response', function () {

  describe('Success', function () {

    it('should resolve on JSON RPC result', function (done) {

      var json = {result: {_id: 'abc123', email: 'net@citizen.com'}};

      jsonRpcResponse.resolveSuccess(json).then(function resolveSuccess(res) {
        should.exist(res._id);
        res.email.should.equal('net@citizen.com');
      })
        .then(done, done);

    });

    it('should reject on JSON RPC error', function (done) {

      var json = {
        error: {
          code: 404,
          message: 'not_found',
          data: 'Account profile not found.'
        }
      };

      jsonRpcResponse.resolveSuccess(json).catch(function error(err) {
        err.status.should.equal(404);
        assert.isArray(err.errors, 'Top level response property should be an Array');
        err.errors[0].code.should.equal('not_found');
        err.errors[0].title.should.equal('Account profile not found.');
      })
        .then(done, done);

    });

    it('should handle arrays of errors', function (done) {

      var json = {
        error: {
          code: 400,
          message: 'validation_error',
          data: [
            {
              path: 'id',
              message: 'String is too long (25 chars), maximum 24'
            },
            {
              path: 'firstName',
              message: 'String is too long (50 chars), maximum 49'
            }
          ]
        }
      };

      jsonRpcResponse.resolveSuccess(json).catch(function error(err) {
        err.status.should.equal(400);
        assert.isArray(err.errors, 'Top level response property should be an Array');

        err.errors[0].code.should.equal('validation_error');
        err.errors[0].title.should.equal('Id - String is too long (25 chars), maximum 24.');
        err.errors[0].error.path.should.equal('id');
        err.errors[0].error.message.should.equal('String is too long (25 chars), maximum 24');

        err.errors[1].code.should.equal('validation_error');
        err.errors[1].title.should.equal('First Name - String is too long (50 chars), maximum 49.');
        err.errors[1].error.path.should.equal('firstName');
        err.errors[1].error.message.should.equal('String is too long (50 chars), maximum 49');

      })
        .then(done, done);

    });

  });

  describe('Error', function () {

    it('should return JSON-API error format from a JSON-RPC error response', function (done) {

      var jsonRpcError = {
        code: 503,
        message: 'service_unavailable',
        data: 'Service Unavailable'
      };

      var jsonApiError = jsonRpcResponse.resolveError(jsonRpcError);

      jsonApiError.status.should.equal(jsonRpcError.code);
      jsonApiError.errors[0].code.should.equal(jsonRpcError.message);
      jsonApiError.errors[0].title.should.equal(jsonRpcError.data);

      done();

    });

    it('should return input as is if non JSON-RPC format', function (done) {

      var jsonRpcError = {status: 503, title: 'Service Unavailable'};

      var jsonApiError = jsonRpcResponse.resolveError(jsonRpcError);

      jsonApiError.status.should.equal(jsonRpcError.status);
      jsonApiError.title.should.equal(jsonRpcError.title);

      done();
    });

  });

});
