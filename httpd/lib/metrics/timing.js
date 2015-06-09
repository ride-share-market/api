'use strict';

var R = require('ramda'),
  lynx = require('lynx');

var config = require('./../../../config/app'),
  metrics = new lynx(config.get('metrics').host, config.get('metrics').port);

module.exports = R.curry(function(timeStart, metricName, timeFinish) {

  var duration = timeFinish - timeStart;

  metrics.timing(metricName, duration);

  return metricName + '-' + duration;

});
