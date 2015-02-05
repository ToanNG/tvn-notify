var fs = require('fs');
var app = require('express')();
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  var clients = {};

  // Get a reference to our raw Node HTTP server
  var httpServer = worker.getHTTPServer();
  // Get a reference to our realtime SocketCluster server
  var scServer = worker.getSCServer();
  
  app.use(serveStatic(path.resolve(__dirname, 'demo')));

  httpServer.on('req', app);

  /*
    In here we handle our incoming realtime connections and listen for events.
    From here onwards is just like Socket.io but with some additional features.
  */
  scServer.on('connection', function (socket) {
    /*
      Store that socket's session for later use.
      We will emit events on it later - Those events will 
      affect all sockets which belong to that session.
    */
    socket.on('user join', function(user){
      if (!user || !user.id) {
        return socket.emit('connect error', 'User fails connecting');
      }

      console.log((new Date).toUTCString() + ' user ' + user.id + ' connected');
      socket.user = user;
      //console.log(socket.user.id + "///////////////////////");
      //console.log(socket.session);
      clients[user.id] = socket.session;
    });

    socket.on('notify', function(data){
      if (!socket.user) {
        return socket.emit('connect error', 'User fails sending message');
      }

      console.log((new Date).toUTCString() + ' user ' + socket.user.id + ' sent message to user ' + data.receiverId);
      console.log(clients);
      console.log(clients[data.receiverId]);
      var socketId = clients[data.receiverId];
      if (socketId) {
        clients[data.receiverId].emit('notify', {message: data.message, senderId: data.receiverId});
        //io.to(socketId).emit('notify', message, socket.user);
      }
    });
  });
  
  scServer.on('sessionEnd', function (ssid) {
    console.log("Session " + ssid + " end");
    clients[socket.user.id] = undefined;
  });
};