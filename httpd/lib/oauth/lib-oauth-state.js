'use strict';

var assert = require('assert'),
  R = require('ramda'),
  Q = require('q');
  //couchbase = require('couchbase');

var config = require('./../../../config/app'),
  //cluster = new couchbase.Cluster('couchbase://' + config.get('couchbase').host),
  //bucket = cluster.openBucket(config.get('couchbase').oauthStateBucket),
  oauthBucket = require(config.get('root') + '/config/couchbase').oauthBucket();

function bucketUpsert(bucket, documentName) {

  assert.equal(typeof bucket, 'object', 'argument bucket must be an object');
  assert.equal(typeof documentName, 'string', 'argument documentName must be a string');

  var timeNow = Date.now();
  var documentValue = {
    created_at: timeNow,
    expires_at: timeNow + (config.get('couchbase').oauthStateExpires * 1000)
  };

  return Q.ninvoke(
    bucket, 'upsert',
    documentName, documentValue, {expiry: config.get('couchbase').oauthStateTtl}).then(function (res) {

    if (!res.cas) {
      throw new Error('Bucket Upsert Failed.');
    }

    return res.cas;

  });

}

function bucketGet(bucket, documentName) {

  assert.equal(typeof bucket, 'object', 'argument bucket must be an object');
  assert.equal(typeof documentName, 'string', 'argument documentName must be a string');

  return Q.ninvoke(bucket, 'get', documentName).then(function (res) {

    if (!res.cas || !res.value) {
      throw new Error('Bucket Get Failed.');
    }

    return res.value;

  });

}

function bucketRemove(bucket, documentName) {

  assert.equal(typeof bucket, 'object', 'argument bucket must be an object');
  assert.equal(typeof documentName, 'string', 'argument documentName must be a string');

  return Q.ninvoke(bucket, 'remove', documentName).then(function (res) {

    if (!res.cas) {
      throw new Error('Bucket Remove Failed.');
    }

    return res.cas;

  });

}

function isValid(stateDocument) {

  assert.equal(typeof stateDocument, 'object', 'argument stateDocument must be an object');

  var timeNow = Math.floor(Date.now() / 1000);

  var expireTime = Math.floor(stateDocument.expires_at / 1000);

  return ((expireTime - timeNow) > 0) ? Q.resolve('Valid oauth state token') : Q.reject('Expired oauth state token');

}

var upsert = R.curry(bucketUpsert);
var get = R.curry(bucketGet);
var remove = R.curry(bucketRemove);

exports.upsert = upsert(oauthBucket);
exports.get = get(oauthBucket);
exports.isValid = isValid;
exports.remove = remove(oauthBucket);
