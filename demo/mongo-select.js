'use strict';


var config = require('../config/config'),
  _ = require('lodash');

require(config.get('root') + '/config/mongodb.js');

var mongoose = require('mongoose'),
  Rideshare = mongoose.model('Rideshare'),
  select = require('mongo-select').select();

var projection = select.include([
  'itinerary.type',
  'itinerary.route.place',
  'created_at',
  'updated_at'
]);

//console.log(projection);

var query = Rideshare.find({}, projection).limit(1);

var promise = query.exec();

promise.then(function (result) {

//  console.log(result);
  console.log(result[0]._id);
  console.log(result[0].itinerary.type);
  _.forEach(result[0].itinerary.route, function (route) {
    console.log(route);
  })
  console.log(result[0].created_at);
  console.log(result[0].updated_at);

  mongoose.connection.close();
})
  .then(null, function (err) {
    console.log(err);
    mongoose.connection.close();
  });
