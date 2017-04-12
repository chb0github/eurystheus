var amqp = require('amqplib/callback_api');

amqp.connect('amqp://somehost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var ex = 'expiration';

        ch.assertExchange(ex, 'x-delayed-message', {durable: true});

        ch.assertQueue('', {exclusive: true}, function(err, q) {
            if(err)
                throw new Error(err);

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg) {
                console.log(" [x] %s   %s", new Date().toISOString(), msg.content.toString());
            }, {noAck: true});
        });
    });
});
