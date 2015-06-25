'use strict';

var config = require('./../../config/app'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization'),
  usersFindById = require(config.get('root') + '/httpd//lib/users/lib-users-find-by-id'),
  ridesharesController = require(config.get('root') + '/httpd/controllers/rideshares'),
  userPolicy = require(config.get('root') + '/httpd/lib/users/users-policy');

module.exports = function (router) {

  router.post('/rideshares', auth(), function *() {

    try {

      // TODO: validate body (id, user id, itinerary etc)

      var validUser = yield usersFindById(this.jwtToken.id);

      var rideshare = this.request.body;

      rideshare.user = validUser.users._id;

      var newRrideshare = yield ridesharesController.create(rideshare);

      this.body = newRrideshare;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  router.get('/rideshares', function *() {

    try {
      this.body = yield ridesharesController.findAll();
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }
  });

  router
    .param('id', function *(id, next) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return this.status = 404;
      }
      yield next;
    })
    .get('/rideshares/:id', function *() {

      try {
        this.body = yield ridesharesController.findById(this.params.id);
      }
      catch (e) {
        this.throw(e.status, {message: {errors: e.errors}});
      }

    })
    .put('/rideshares/:id', auth(), function *() {

      try {

        // TODO: validate body (id, user id, itinerary etc)

        // Check requesting user is valid
        var validUser = yield usersFindById(this.jwtToken.id);

        // Check requester is the owner of this rideshare
        if (validUser.users._id !== this.request.body.user) {
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

    })
    .del('/rideshares/:id', auth(), function *() {

      try {

        // 1st check user is valid
        var validUser = yield usersFindById(this.jwtToken.id);

        // 2nd fetch the item to be removed
        var rideshares = yield ridesharesController.findById(this.params.id);

        // 3rd validate the requester is the owner
        if (!userPolicy.isOwner(validUser.users._id, rideshares.rideshares[0])) {
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
