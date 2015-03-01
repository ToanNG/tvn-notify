var fs = require('fs');
var app = require('express')();
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  
  var scServer = worker.getSCServer();

  scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE,
    function (socket, channel, next) {
      console.log(socket.sessionIdentification);
      console.log(channel);
      next();
    }
  );

  scServer.on('connection', function (socket) {
    socket.on('user join', function(user){
      socket.sessionIdentification = user.ssid;
      socket.emit('user join successfully');
    });

    socket.on('notify', function(data){
      scServer.global.publish(data.receiverId, {message: data.message});
    });

    socket.on('benchmark', function(payload){
      console.log(payload);
    });
  });
  
  scServer.on('sessionEnd', function (ssid) {
    console.log("Session " + ssid + " end");
  });
};