'use strict';

var config = require('./../../config/app'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization'),
  usersFindById = require(config.get('root') + '/httpd//lib/users/lib-users-find-by-id'),
  ridesharesController = require(config.get('root') + '/httpd/controllers/rideshares'),
  userPolicy = require(config.get('root') + '/httpd/lib/users/users-policy');

module.exports = function (router) {

  router.get('/rideshares', function *() {

    try {
      this.body = yield ridesharesController.findAll();
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }
  });

  router.get('/rideshares/:id', function *() {

    try {
      this.body = yield ridesharesController.findById(this.params.id);
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.post('/rideshares', auth(), function *() {

    // TODO: validate body (id, user id, itinerary etc)

    var assert = require('assert');

    function buildRideshare(userId, requestBody) {

      assert.equal(typeof (userId), 'string', 'argument userId must be a string');

      assert.equal(typeof (requestBody), 'object', 'argument requestBody must be an object');

      var rideshare = requestBody;

      rideshare.user = userId;

      return rideshare;

    }

    try {

      var validUser = yield usersFindById(this.jwtToken.id);

      var rideshare = yield buildRideshare(validUser.users._id, this.request.body);

      var newRrideshare = yield ridesharesController.create(rideshare);

      this.body = newRrideshare;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.put('/rideshares/:id', auth(), function *() {

    try {

      // TODO: validate body (id, user id, itinerary etc)

      // Check requesting user is valid
      var validUser = yield usersFindById(this.jwtToken.id);

      // Check requester is the owner of this rideshare
      if(validUser.users._id !== this.request.body.user) {
        this.throw(401, {
          errors: [
            {
              code: 'authorization_required',
              title: 'Please sign in to complete this request.'
            }
          ]
        });
      }

      this.body = yield ridesharesController.update(this.request.body);
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.del('/rideshares/:id', auth(), function *() {

    try {

      // 1st check user is valid
      var validUser = yield usersFindById(this.jwtToken.id);

      // 2nd fetch the item to be removed
      var rideshares = yield ridesharesController.findById(this.params.id);

      // 3rd validate the requester is the owner
      if(!userPolicy.isOwner(validUser.users._id, rideshares.rideshares[0])) {
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
