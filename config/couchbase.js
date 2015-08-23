'use strict';

// Open a single connection to couchbase for reuse in the application.

/**
 * http://docs.couchbase.com/developer/node-2.0/performance-tuning.html
 *
 * Couchbase bucket connections are relatively expensive to establish in relation
 * to the operations performed on them.
 *
 * Because of this, you should open each bucket only once per application instance.
 *
 * Due to multiplexing performed within the SDK, opening multiple connections can cause
 * issues and will not benefit performance in most cases.
 */

var couchbase = require('couchbase');

var config = require('./app');

var cluster = new couchbase.Cluster('couchbase://' + config.get('couchbase').host),
  oauthBucket = cluster.openBucket(config.get('couchbase').oauthStateBucket);

exports.oauthBucket = function() {
  return oauthBucket;
};
