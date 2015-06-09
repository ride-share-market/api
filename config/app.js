'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'loc',
  path = require('path'),
  nconf = require('nconf');

// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
nconf.argv()
  .env()
  .file({file: __dirname + '/env/' + env + '.json'});

nconf.defaults({

  root: path.normalize(__dirname + '/..'),

  app: {
    name: 'Ride Share Market API',
    protocol: 'https://',
    hostname: 'ridesharemarket.com'
  }

});

module.exports = nconf;
