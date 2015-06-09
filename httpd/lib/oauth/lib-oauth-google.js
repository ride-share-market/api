'use strict';

var config = require('./../../../config/app'),
  Q = require('q'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

// TODO: Use the new Promoise based API
// TODO: https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiclientload
// TODO: http://googledevelopers.blogspot.com/2014/10/promises-in-google-apis-javascript.html

var validateOauthCode = function validateOauthCode(code) {
  var deferred = Q.defer();

  // TODO: better validatation

  if (!code) {
    deferred.reject('Missing require Oauth Code');
  }
  else {
    deferred.resolve(code);
  }

  return deferred.promise;
};

var getOauthToken = function getOauthToken(oauth2Client, code) {
  var deferred = Q.defer();

  oauth2Client.getToken(code, function (err, tokens) {
    if (err) {
      deferred.reject(err);
    }
    else {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      deferred.resolve(tokens);
    }
  });

  return deferred.promise;
};

var getGoogleUser = function getGoogleUser(oauth2Client, tokens) {
  var deferred = Q.defer();

  oauth2Client.setCredentials(tokens);

  var plus = google.plus('v1');

  plus.people.get({userId: 'me', auth: oauth2Client}, function (err, response) {

    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(response);
    }
  });

  return deferred.promise;
};

module.exports = function (code) {

  var oauth2Client = new OAuth2(
    config.get('oauth').providers.google.clientId,
    config.get('oauth').providers.google.clientSecret,
    [
      config.get('oauth').protocol,
      config.get('oauth').redirectUrl.location,
      config.get('oauth').providers.google.redirectPath
    ].join('')
  );

  return validateOauthCode(code)
    .then(function (code) {
      return getOauthToken(oauth2Client, code);
    })
    .then(function (tokens) {
      return getGoogleUser(oauth2Client, tokens);
    });

};
