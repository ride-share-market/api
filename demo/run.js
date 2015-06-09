'use strict';

var buildMessage = require('./augment-message'),
  mongoose = require('mongoose');

var message = {
  uuid: '42244ce6-ff97-cea7-e58a-78e867e8d89e',
  userIdFrom: '539bec6dbd3d7f5c5f698069',
  rideshareId: '535352288f260ddf19b8219b',
  message: 'Default Message',
  jsonrpc: '2.0',
  created_at: Date.now(),
  sessionId: '6pSXRLisOdi2s5jJ9js2ZlEA'
};

buildMessage.getRidewhareOwnerDetails(message)
  .then(buildMessage.getSenderDetails)
  .then(function (result) {
    console.log(result);
  })
  .fail(null, function (err) {
    console.log(err);
  })
  .finally(function () {
    // if command line
    if (require.main === module) {
      mongoose.connection.close();
    }
  })
  .done();
