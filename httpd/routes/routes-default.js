'use strict';

module.exports = function (router, app) {

  // Custom 404 page
  app.use(function *pageNotFound(next) {
    yield next;

    if (404 !== this.status) {
      return;
    }

    // we need to explicitly set 404 here
    // so that koa doesn't assign 200 on body=
    this.status = 404;

    //switch (this.accepts('html', 'json')) {
    switch (this.accepts('html', 'text', 'application/vnd.api+json', 'json')) {

      case 'html':
        this.type = 'html';
        this.body = '<p>Page Not Found</p>';
        break;

      case 'application/vnd.api+json':
      case 'json':
        this.body = {
          message: 'Page Not Found'
        };
        break;

      default:
        this.type = 'text';
        this.body = 'Page Not Found';
    }
  });

};
