var http = require('http');

var server = http.createServer(function(req,res) {
    console.log(req.url);
    var data = '';
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end',function() {
       console.log(data);
    });
    res.end();
});

server.listen(8080, function() {
    console.log("listening");
});
