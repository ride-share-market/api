'use strict';

var should = require('chai').should();

var config = require('./../../../config/app'),
  jwtManager = require('./jwtManager');

var token = jwtManager.issueToken({name: 'Test'});

describe('jwt Manager Test', function () {

  it('should issue JWT Tokens', function (done) {

    token.should.match(/^[0-9a-zA-Z-_]+\.[0-9a-zA-Z-_]+\.[0-9a-zA-Z-_]+/);
    done();

  });

  it('should verify JWT tokens', function () {

    var jwt = jwtManager.verifyToken(token);
    jwt.name.should.equal('Test');
    should.exist(jwt.iat);

  });

  it('should handle verify token errors', function () {

    var currentJwtTokenSecret = config.get('jwtTokenSecret');

    config.set('jwtTokenSecret', 'xxxyyyzzz');

    try {
      jwtManager.verifyToken(token);
    }
    catch (e) {
      e.message.should.match(/invalid\ signature/);
      // reset jwtTokenSecret back to original for other tests.
      config.set('jwtTokenSecret', currentJwtTokenSecret);
    }

  });

});
