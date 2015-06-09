'use strict';

var amqp = require('amqplib');

amqp.connect('amqp://192.168.33.10').then(
  function (conn) {

    conn.createConfirmChannel().then(function (ch) {

      var ok = ch.assertQueue('foo', {durable: true});

      ok.then(function () {

        ch.sendToQueue('foo', new Buffer('bar'), { persistent: true }, function (err, ok) {

          if (err !== null) {
            console.warn('Message nacked!');
          }
          else {
            console.log('Message acked');
          }

          ch.close().then(function () {
            conn.close();
          });

        });

      });

    });

//  }).then(null, console.warn);
  },
  function (err) {
    console.warn(err);
  });
