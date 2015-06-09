'use strict';

var config = require('./../../../config/app'),
  jwt = require('jsonwebtoken');

module.exports.issueToken = function(payload) {
  // return a JWT token
  return jwt.sign(payload, config.get('jwtTokenSecret'));
};

module.exports.verifyToken = function(token) {
  return jwt.verify(token, config.get('jwtTokenSecret'));
};
