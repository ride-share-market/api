'use strict';

var config = require('./../../config/app'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization'),
  ridesharesController = require(config.get('root') + '/httpd/controllers/rideshares'),
  userPolicy = require(config.get('root') + '/httpd/lib/users/users-policy');

module.exports = function (router) {

  router.get('/rideshares', function *() {

    try {
      var rideshares = yield ridesharesController.findAll();
      this.body = rideshares;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }
  });

  router.get('/rideshares/:id', function *() {

    try {
      var rideshares = yield ridesharesController.findById(this.params.id);
      this.body = rideshares;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.post('/rideshares', auth(), function *() {

    // curl -i -H 'Accept: application/vnd.api+json' -H 'Content-Type: application/vnd.api+json' --data '{"itinerary": { "route": [{"place": "Melbourne"},{"place": "Sydney"}],"type": "Wanted"}}' localhost:3001/rideshares

    var assert = require('assert');
      //q = require('q');

    function buildRideshare(userId, requestBody) {

      assert.equal(typeof (userId), 'string', 'argument userId must be a string');
      assert.equal(typeof (requestBody), 'object', 'argument requestBody must be an object');

      var rideshare = requestBody;
      // TODO: validate userId is active user
      rideshare.user = userId;
      return rideshare;

      //return q.reject({
      //    status: 400,
      //    errors: [
      //      {
      //        code: 'invalid_format',
      //        title: 'Invalid Rideshare.'
      //      }
      //    ]
      //  }
      //);

    }

    try {

      var rideshare = yield buildRideshare(this.jwtToken.id, this.request.body);

      var newRrideshare = yield ridesharesController.create(rideshare);

      this.body = newRrideshare;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.put('/rideshares/:id', auth(), function *() {

    try {

      // TODO: validate user is owner
      // TODO: validate body

      var result = yield ridesharesController.update(this.request.body);

      this.body = result;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.del('/rideshares/:id', auth(), function *() {

    try {

      // 1st fetch the item to be removed
      var rideshares = yield ridesharesController.findById(this.params.id);

      // 2nd validate the requester is the owner
      if(!userPolicy.isOwner(this.jwtToken.id, rideshares.rideshares[0])) {
        this.throw(401, {
            errors: [
              {
                code: 'authorization_required',
                title: 'Please sign in to complete this request.'
              }
            ]
        });
      }

      // 3rd delete
      this.body = yield ridesharesController.removeById(this.params.id);
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });
};
