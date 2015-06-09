'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'loc',
  config = require('./config'),
  bunyan = require('bunyan');

var logger = bunyan.createLogger({
  name: 'worker-app',
  streams: [
    {
      path: config.get('root') + 'log/worker-app-' + env + '.log'
    }
  ]
});

module.exports = logger;
