'use strict';

var should = require('chai').should(),
  fs = require('fs');

var config = require('../../../config/app'),
  formatUserResponse = require('./format-user-response');

var userFixture = JSON.parse(fs.readFileSync(config.get('root') + '/test/fixtures/http_get_200_user.json').toString());

describe('Format User Reponse', function () {

  it('should format and restrict user response properties', function () {
    var user = formatUserResponse(userFixture);
    should.exist(user._id);
    user.providers.should.be.instanceof(Array);
    should.exist(user.providers[0].google);
    should.exist(user.providers[1].facebook);
    should.exist(user.providers[2].linkedin);
  });


});
