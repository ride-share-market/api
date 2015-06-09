'use strict';

var should = require('chai').should();

var facebookUrl = require('./lib-oauth-facebook-url');

describe('Oauth', function() {

  describe('Facebook', function() {

    it('should return a facebook oauth signin URL', function() {
      should.exist(facebookUrl);
      facebookUrl().should.match(/facebook\.com.*scope.*client_id.*redirect_uri/);
    });

  });

});
