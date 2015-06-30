'use strict';

var assert = require('assert'),
  q = require('q');


function camelCaseToWords(str) {
  if(!str) {
    return '!';
  }
  return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function (x) {
    return x[0].toUpperCase() + x.substr(1).toLowerCase();
  }).join(' ');
}

/**
 * A successful JSON-RPC message may contain either result or error
 *
 * Extract the 'result' or 'error' property and return that in a promise
 *
 * @param jsonRpc
 * @returns {Promise|promise|*|when.promise|Deferred.promise|Q.promise}
 */
exports.resolveSuccess = function resolveSuccess(jsonRpc) {

  assert.equal(typeof (jsonRpc), 'object', 'argument jsonRpc must be an object');

  var deferred = q.defer();

  if (jsonRpc.result) {
    deferred.resolve(jsonRpc.result);
  }
  else {
    // Map JSON-RPC properties to JSON-API properties
    // Receive: JSONRPC Error object (code, message, data)
    // Return:  JSONAPI Error object (status, code, title)
    /**
     * JSON-RPC code => JSON-API status
     * JSON-RPC message => JSON-API code
     * JSON-RPC data => JSON-API title
     */
    var jsonApiError = {
      status: jsonRpc.error.code,
      errors: []
    };

    if (typeof (jsonRpc.error.data) === 'string') {
      jsonApiError.errors.push({
        code: jsonRpc.error.message,
        title: jsonRpc.error.data
      });
    }
    else {
      jsonRpc.error.data.map(function (error) {

        // MongoDB validation errors will be an object with name, path, type
        // zSchema validation errors will be an object with path, message

        var err = {
          code: jsonRpc.error.message,
          error: error
        };

        if(error.name) {
          err.title = [camelCaseToWords(error.path), error.type].join(' is ');
        }
        else {
          err.title = [camelCaseToWords(error.path), error.message].join(' - ');
        }

        // Punctuation for the human readable message
        err.title = err.title.concat('.');

        jsonApiError.errors.push(err);
      });
    }

    deferred.reject(jsonApiError);
  }

  return deferred.promise;
};

/**
 * Receive: JSONRPC Error object (code, message)
 * Return:  JSONAPI Error object (status, title)
 *
 * @param error
 * @returns {error|error object JSONAPI format}
 */
exports.resolveError = function resolveError(error) {

  assert.equal(typeof (error), 'object', 'argument \'error\' must be an object');

  if (!error.code) {
    return error;
  }

  var jsonApiError = {
    status: error.code,
    errors: [
      {
        code: error.message,
        title: error.data
      }
    ]
  };

  return jsonApiError;
};
