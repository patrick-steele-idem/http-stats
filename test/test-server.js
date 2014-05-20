if (process.argv[1].indexOf('mocha') === -1) {
    var port = 9992;
    var express = require('express');
    var app = express();

    var http = require('http');
    var server;

    console.log('Starting test server on port ' + port);
    app.get('/', function(req, res) {
        setTimeout(function() {
            res.send({hello: 'world'});
        }, 10);
    });

    server = http.createServer(app);
    server.listen(port, function() {
        console.log('Test server listening on port ' + port);
    });
}