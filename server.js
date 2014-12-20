var app = require('express')()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
;

app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
  res.send('Server running');
});

require('./socketio')(io);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
});