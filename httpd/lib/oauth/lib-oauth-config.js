'use strict';

var assert = require('assert');

exports.get = function (config, providerName) {

  assert.equal(typeof config, 'object', 'required argument config must be an object');

  assert.equal(typeof providerName, 'string', 'required argument  must be a string');

  var configs = {
    google: function (config) {
      return google(config);
    },
    facebook: function (config) {
      return facebook(config);
    },
    linkedin: function (config) {
      return linkedin(config);
    }
  };

  return configs[providerName].call(null, config);

};

function google(config) {
  return {
    clientId: config.providers.google.clientId,
    clientSecret: config.providers.google.clientSecret,
    redirectUrl: {
      protocol: config.protocol,
      host: config.host,
      uri: config.providers.google.redirectPath
    }
  };
}

function facebook(config) {
  return {
    appId: config.providers.facebook.appId,
    appSecret: config.providers.facebook.appSecret,
    redirectUrl: {
      protocol: config.protocol,
      host: config.host,
      uri: config.providers.facebook.redirectUri
    }
  };
}

function linkedin(config) {
  return {
    clientId: config.providers.linkedin.clientId,
    clientSecret: config.providers.linkedin.clientSecret,
    redirectUrl: {
      protocol: config.protocol,
      host: config.host,
      uri: config.providers.linkedin.redirectUri
    }
  };
}
