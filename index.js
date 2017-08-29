var WebSocketServer = require('ws').Server;
var port = process.argv[2] || 8080;
var wss = new WebSocketServer({port: port});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      console.log('Received from client: %s', message);
      ws.send('Server received from client: ' + message);
    });
});


console.log('websocket server has been created successfully');