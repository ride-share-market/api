'use strict';

var should = require('chai').should();

var rideshares = require('./index');

describe('Rideshares', function () {

  it('should expose CRUD operations', function (done) {

    should.exist(rideshares.findAll);
    should.exist(rideshares.findById);
    should.exist(rideshares.create);
    should.exist(rideshares.removeById);

    done();

  });

});
