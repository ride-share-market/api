'use strict';

var helmet = require('koa-helmet'),
  compress = require('koa-compress'),
  router = require('koa-router')(),
  cors = require('koa-cors'),
  requireWalk = require('require-walk'),
  koaJsonLogger = require('koa-json-logger'),
  koaJsonApiHeaders = require('koa-jsonapi-headers'),
  bodyParser = require('koa-bodyparser');

var config = require('../config/app');

module.exports = function (app) {

  // A local environment delay to simulate internet latency
  function delay(milliseconds) {
    var deferred = Q.defer();
    setTimeout(deferred.resolve, milliseconds);
    return deferred.promise;
  }

  // Optionally add Development delay (simulate real time web lag)
  if (process.env.DEV_DELAY) {

    var Q = require('q'),
      delayInterval = 750;

    app.use(function *(next) {
      console.log('Development environment delay of ' + delayInterval + 'ms');
      yield delay(delayInterval); // Note: this yield has no useful return value
      yield next;
    });

  }

  app.use(helmet());

  app.use(bodyParser());

  //TODO: CORS origin filter
  //app.use(function *(next) {
  //  console.log('origin', this.header['origin']);
  //});

  // koa-json-logger will set content-type to application/vnd.api+json
  // but for oauth 302 redirects we will set the content-type to text/html
  app.use(function *(next) {
    yield next;
    if (this.status === 302) {
      this.response.type = 'text/html';
    }
  });

  app.use(koaJsonLogger({
    name: 'api-http',
    jsonapi: true
  }));

  // Set CORS headers in reply
  app.use(cors({
    origin: true,
    credentials: true,
    headers: ['Accept', 'Content-Type', 'Authorization']
  }));

  app.use(koaJsonApiHeaders({excludeList: [
    'signin\/google',
    'auth\/google\/callback',
    'signin\/facebook',
    'auth\/facebook\/callback',
    'signin\/linkedin',
    'auth\/linkedin\/callback'
  ]}));

  app.use(compress());

  function *responseTime(next) {
    /*jshint validthis: true*/
    var start = new Date();
    yield next;
    var ms = new Date() - start;
    this.set('X-Response-Time', ms + 'ms');
    //console.log('%s %s %s - %s', this.ip, this.method, this.url, ms);
  }

  app.use(responseTime);

  //app.use(router(app));

  // Routes
  requireWalk(config.get('root') + '/httpd/routes')(router, app);

  app
    .use(router.routes())
    .use(router.allowedMethods());

};
