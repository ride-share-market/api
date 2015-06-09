'use strict';

var config = require('./../../../config/app'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  config.get('oauth').providers.google.clientId,
  config.get('oauth').providers.google.clientSecret,
  [
    config.get('oauth').protocol,
    config.get('oauth').redirectUrl.location,
    config.get('oauth').providers.google.redirectPath
  ].join('')
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

module.exports = function () {
  return url;
};
