var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


/**
 * Serve client.html file
 */
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));


/**
 * Socket.io connection
 */
io.on('connection', function (socket) {

  /**
   * Sending out dummy data
   */
  socket.emit('tmp', { hello: 'world' });

  /**
   * Handler for receiving message from client
   */
  socket.on('message', function (data) {
    console.log('SocketIO received: ', message);
  });
});


/**
 * Server listens to port 8000
 */
server.listen(8000);
