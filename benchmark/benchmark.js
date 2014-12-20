var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);

io.on('connection', function(socket){
  
  socket.on('user join', function(user){
    
  });

  socket.on('message',function(message){
    console.log(message);
    socket.send(message);
  });

  socket.on('disconnect', function(){
    
  });
});

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});