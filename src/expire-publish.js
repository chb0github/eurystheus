var amqp = require('amqplib/callback_api');

amqp.connect('amqp://somehost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        if(err)
            throw new Error(err);
        var ex = 'expiration';
        var args = process.argv.slice(2);


        var msg = args.join(' ') || new Date().toString() + ' Hello 30000!';

        //function(exchange, routingKey, content, options)
        ch.assertExchange(ex, 'x-delayed-message', {durable: true});
        ch.publish(ex, "", new Buffer(msg),{
            headers : {
                'x-delay' : 30000
            }
        });
    });

    setTimeout(function() { conn.close(); process.exit(0) }, 2000);
});
