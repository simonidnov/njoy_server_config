var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({noServer: true});

var http = require('http'),
fs = require('fs');

fs.readFile('src/index.html', function (err, html) {
    if (err) {
        throw err;
    }
    var server = http.createServer(function (request, response) {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
    });

    server.listen(3434);
    server.on('upgrade', wss.handleUpgrade);
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });

        ws.send('something');
    });
});