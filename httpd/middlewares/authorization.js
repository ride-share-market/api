'use strict';

var config = require('./../../config/app'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager');

function authorization() {

  // TODO: logging

  return function *authorization(next) {
    /*jshint validthis: true*/

    var parts, scheme, credentials, token;

    if (this.header.authorization) {

      // Response for any authorization header format errors
      var headerAuthErrorMessage = {
        message: {
          errors: [
            {
              code: 'invalid_request',
              title: 'Bad authorization header format. Format is "Authorization: Bearer <token>"'
            }
          ]
        }
      };

      parts = this.header.authorization.split(' ');

      if (parts.length === 2) {

        scheme = parts[0];
        credentials = parts[1];

        // Check authorization header begins with 'Bearer' keyword
        /^Bearer$/i.test(scheme) ? token = credentials : this.throw(401, headerAuthErrorMessage);

      }
      else {
        this.throw(401, headerAuthErrorMessage);
      }
    }
    else {
      this.throw(401, {
        message: {
          errors: [
            {
              code: 'invalid_request',
              title: 'Authorization header not found'
            }
          ]
        }
      });
    }

    try {
      this.jwtToken = jwtManager.verifyToken(token);
      yield next;
    }
    catch (e) {
      var unauthorizedErrorMessage = {
        message: {
          errors: [
            {
              code: 'authorization_required',
              title: 'Please sign in to complete this request.'
            }
          ]
        }
      };

      // if error from this middleware handle it else rethrow up the middleware stack
      /jwtManager/.test(e.stack) ? this.throw(401, unauthorizedErrorMessage) : this.throw(e);

    }

  };
}

module.exports = authorization;
