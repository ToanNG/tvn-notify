var fs = require('fs');
var app = require('express')();
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  
  // Get a reference to our raw Node HTTP server
  var httpServer = worker.getHTTPServer();
  // Get a reference to our realtime SocketCluster server
  var scServer = worker.getSCServer();
  /*if (scServer.global.clients == undefined)
    scServer.global.clients = [];
  app.use(serveStatic(path.resolve(__dirname, 'demo')));

  httpServer.on('req', app);
  */
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

    socket.on('benchmark', function(payload){
      console.log(payload);
    });
  });
  
  scServer.on('sessionEnd', function (ssid) {
    console.log("Session " + ssid + " end");
    //clients[socket.user.id] = undefined;
  });
};