var fs = require('fs');
var app = require('express')();
var serveStatic = require('serve-static');
var path = require('path');
var request = require('request');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);
  
  var scServer = worker.getSCServer();

  scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE,
    function (socket, channel, next) {
      var sessionId = socket.sessionIdentification;
      var userId = channel.replace('notify-', '');
      var isAuthenticated = false;

      console.log('==========');
      console.log(sessionId);
      console.log(userId);
      console.log('==========');

      request.post({
        url: 'AUTHENTICATE_API', // POST API nhận 2 param user_id and session_id, trả về json có field isAuthenticate (true hoặc false)
        json: true,
        body: {
          user_id: userId,
          session_id: sessionId
        },
        timeout: 5000}, function (error, response, body) {
          if (error) {
            next(error);
          } else {
            if (!error && response.statusCode == 200) {

              // Sau khi có response, kiểm tra isAuthenticated. Nếu true thì allow subscribe
              var isAuthenticated = true; // Hardcode để test
              // var isAuthenticated = body.isAuthenticated;
              
              if (isAuthenticated) {
                next(); // Allow subscribe
              } else {
                next('Subscribe failed'); // Block
              }
            }
          }
      });
    }
  );

  scServer.on('connection', function (socket) {
    socket.on('user join', function(user){
      socket.sessionIdentification = user.ssid;
      socket.emit('user join successfully');
    });

    socket.on('benchmark', function(payload){
      console.log(payload);
    });
  });
  
  scServer.on('sessionEnd', function (ssid) {
    console.log("Session " + ssid + " end");
  });
};