'use strict';
var restify = require('restify');
GLOBAL.config = require('./config');
var find = require('require-all');
var p = require('path');

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

