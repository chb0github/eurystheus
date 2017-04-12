'use strict';
var restify = require('restify');
GLOBAL.config = require('./config');
var find = require('require-all');
var p = require('path');
import amqp from 'amqplib';

import taskServer from './ws/services/task-service.js';

var foo = amqp.connect('amqp://ncp-cb-1.nintextest.com', function (err, conn) {
    console.log("hello?");
    conn.createChannel(function (err, ch) {

        taskServer.channel = ch;
        console.log("hello?");
        ch.assertExchange(config.expirationQueue.exchange, 'x-delayed-message', {durable: true});

        ch.assertQueue(QUEUE_NAME, {exclusive: true}, function (err, q) {
            if (err)
                throw new Error(err);

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            ch.bindQueue(q.queue, config.expirationQueue.exchange, '');

            ch.consume(q.queue, function (msg) {
                taskServer.receiveResponse(msg);
            }, {noAck: true});
        });
    });
});
console.log(foo);

var server = restify.createServer({
    name: "Eurystheus - Taskmaster of Hercules.",
    formatters: {
        'text/plain': function (req, res, body, cb) {
            body = body.toString();
            res.setHeader('Content-Length', Buffer.byteLength(body));
            cb(null, body);
        }
    }
});

server.on('uncaughtException', function (req, res, route, err) {
    var output = err.stack.split("\n");
    console.log(err.stack);
    res.send(500, {code: 500, stack: output});
});

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(restify.dateParser());
server.use(restify.acceptParser(server.acceptable));


 var controllers = find({
     dirname: __dirname + '/ws/controllers/',
     filter: '.*controller\.js',
     resolve: function (Controller) {
         return new Controller(server);
     },
     map: function (name, path) {
         return p.basename(path, '.js');
     }
 });

server.listen(7070,  () => {
    // var sentence = Sentencer.make("Listening for {{ adjective }} {{ nouns }} on %s.");
    console.log(`Listening on ${server.url}`);
});

var close = function () {
    server.close();
};


module.exports = {
    close : close,
    server : server
};
