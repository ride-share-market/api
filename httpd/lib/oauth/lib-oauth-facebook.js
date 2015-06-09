'use strict';

/*
Facebook Oauth
Returns a facebook user profile object
image url use the id from the 'me' response
graph.facebook.com/1601409773470363/picture
graph.facebook.com/1601409773470363/picture?type=large
To show:
50x50 pixels

<img src="//graph.facebook.com/{{fid}}/picture">

200 pixels width

<img src="//graph.facebook.com/{{fid}}/picture?type=large">
*/

var FB = require('fb'),
  q = require('q');

var config = require('./../../../config/app');

function getOauthAccessToken(code) {

  var deferred = q.defer();

  var redirectUri = [
    config.get('oauth').protocol,
    config.get('oauth').redirectUrl.location,
    config.get('oauth').providers.facebook.redirectUri
  ].join('');

  FB.api('oauth/access_token', {
    client_id: config.get('oauth').providers.facebook.appId,
    client_secret: config.get('oauth').providers.facebook.appSecret,
    redirect_uri: redirectUri,
    code: code
  }, function (res) {
    if (!res || res.error) {
      deferred.reject(!res ? 'oauth/access_token error occurred.' : res.error);
    }
    else {
      var accessToken = res.access_token;
      var expires = res.expires ? res.expires : 0;
      deferred.resolve({
        accessToken: accessToken,
        expires: expires
      });
    }
  });

  return deferred.promise;

}

function getFacebookProfile(token) {

  var deferred = q.defer();

  FB.api('me', {access_token: token.accessToken}, function (res) {
    deferred.resolve(res);
  });

  return deferred.promise;

}

module.exports = function (code) {

  return getOauthAccessToken(code)
    .then(function (token) {
      return getFacebookProfile(token);
    });

};
