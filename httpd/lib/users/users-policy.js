'use strict';

var assert = require('assert');

exports.isOwner = function (userId, rideshare) {

  // input validation
  assert.ok(/^[0-9a-fA-F]{24}$/.test(userId), 'argument userId must consist of 24 hexadecimal characters');

  assert.equal(typeof(rideshare), 'object', 'argument rideshare must be an object');
  assert.ok(/^[0-9a-fA-F]{24}$/.test(rideshare.user._id), 'argument rideshare.user._id must consist of 24 hexadecimal characters');

  return userId === rideshare.user._id;

};
