'use strict';

var config = require('./config'),
  logger = require('./log'),
  amqp = require('amqplib');

var connection = null;

var amqpClient = {

  getConnection: function () {
    if (!connection) {
      this.createConnection();
    }

    return connection;
  },

  createConnection: function () {
    connection = amqp.connect('amqp://rsm_user:abcdef@' + config.get('messageQueue').rabbitmq.url + config.get('messageQueue').rabbitmq.vhost);
  },

  resetConnection: function () {
    connection = null;
  }

};

// If RabbitMQ is down we don't want the web app to stop.
// Message unable to be sent will be logged to file and into Logstash/Kibana
// Error messages will be alerted on and relayed to systems admin for a fix.
// So if a RabbitMQ connection error bubbles up, check the error stack for the keywork 'amqplib' and catch it.
// else rethrow the error and crash the node app (upstart will restart)
// In both cases log to file and alert systems admin
process.on('uncaughtException', function (err) {

  logger.error('Caught uncaughtException Node process exception: ' + err.stack);

  // Look for amqp
  var patt = /amqplib/g;
  var result = patt.test(err.stack);
  if (result) {
    // Reset the RabbitMQ connection so that next message will attempt to reconnect
    amqpClient.resetConnection();
  }
  else {
    // rethrow the error, crash the node process (upstart will restart)
    throw new Error(err.stack);
  }

});

module.exports = amqpClient;
