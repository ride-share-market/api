'use strict';

var config = require('./../../config/app'),
  usersController = require(config.get('root') + '/httpd/controllers/users/controller-users-find'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization');

module.exports = function (router) {

  router
    .param('id', function *(id, next) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return this.status = 404;
      }
      yield next;
    })
    .get('/users/:id', auth(), function *() {

      try {
        this.body = yield usersController.findById(this.params.id);
      }
      catch (e) {
        //console.log('e', e);
        this.throw(e.status, {message: {errors: e.errors}});
      }

    });

};
