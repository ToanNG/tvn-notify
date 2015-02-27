var fs = require('fs');
var app = require('express')();
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  var clients = [];

  // Get a reference to our raw Node HTTP server
  var httpServer = worker.getHTTPServer();
  // Get a reference to our realtime SocketCluster server
  var scServer = worker.getSCServer();
  if (worker.global.clients == undefined)
      worker.global.clients = [];
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
      //console.log(socket.user.id + "///////////////////////");
      clients[user.id] = socket.session;
      worker.global.clients[user.id] = socket.session;
      //console.log(clients[user.id]);
    });

    socket.on('notify', function(data){
      //console.log(clients);
      //console.log(clients[data.receiverId]);
      console.log(data.receiverId);
//      var socketSession = clients[data.receiverId];
      var socketSession = worker.global.clients[data.receiverId];

      console.log(socketSession != undefined? "receiver is online":"socketSession is undefined");
      if (socketSession) {
        console.log((new Date).toUTCString() + ' A message was sent to user ' + data.receiverId);
        socketSession.emit('notify', {message: data.message});
      } else {
        socket.emit('connect error', 'User fails sending message');
      }
    });

    socket.on('benchmark', function(payload){
      console.log(payload);
    });
  });
  
  scServer.on('sessionEnd', function (ssid) {
    console.log("Session " + ssid + " end");
    //clients[socket.user.id] = undefined;
  });
};