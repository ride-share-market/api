'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'loc',
  config = require('./app'),
  bunyan = require('bunyan');

var logger = bunyan.createLogger({
  name: 'worker-app',
  streams: [
    {
      path: config.get('root') + '/log/api-' + env + '.log'
    }
  ]
});

module.exports = logger;
