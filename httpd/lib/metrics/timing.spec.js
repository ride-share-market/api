'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  lynx = require('lynx');

var timing = require('./timing');

describe('Metrics', function() {

  describe('Timing', function() {

    it('should return a stat and duration', function() {

      should.exist(timing);

      var metrics = timing(Date.now());

      var res = metrics('test.controllers.rideshares.find.all.success', Date.now() + 25);

      res.should.match(/test\.controllers\.rideshares\.find\.all\.success-2[0-9]/);

    });

  });

});
