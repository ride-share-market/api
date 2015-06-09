'use strict';

var should = require('chai').should();

var usersPolicy = require('./users-policy');

describe('Users', function () {

  describe('Policy', function () {

    describe('isOwner', function () {

      var rideshare = {
        _id: '55446d7cf2405b0d00cda372',
        user: {
          _id: '5530c570a59afc0d00d9cfdc'
        }
      };
      
      var userId = rideshare.user._id;

      it('should return true ', function () {
        should.exist(usersPolicy);
        usersPolicy.isOwner(userId, rideshare).should.be.true;
      });

      it('should return false', function () {
        userId = '5530c570a59afc0d00d9cfdd';
        usersPolicy.isOwner(userId, rideshare).should.be.false;
      });

    });

  });

});
