#!/usr/bin/env node
// Process tasks from the work queue

var amqp = require('amqplib');

amqp.connect('amqp://admin:abcdef@192.168.33.10').then(function(conn) {

  process.once('SIGINT', function() { conn.close(); });

  return conn.createChannel().then(function(ch) {

    var ok = ch.assertQueue('rsm_task_queue', {durable: true});

    ok = ok.then(function() { ch.prefetch(1); });

    ok = ok.then(function() {
      ch.consume('rsm_task_queue', doWork, {noAck: false});
      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    });
    return ok;

    function doWork(msg) {

//      console.log(msg);

      var body = JSON.parse(msg.content.toString());

      console.log(body.id);

      console.log(" [x] Received '%s'", JSON.stringify(body));

//      var secs = body.split('.').length - 1;

//      console.log(" [x] Task takes %d seconds", secs);
//
//      setTimeout(function() {
//        console.log(" [x] Done");
//        ch.ack(msg);
//      }, secs * 1000);
//    }

      ch.ack(msg);

    };

  });
}).then(null, console.warn);
