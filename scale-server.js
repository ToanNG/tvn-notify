var cluster = require('cluster')
  , numCPUs = require('os').cpus().length
  , redis = require('socket.io-redis')
;

if (cluster.isMaster) {

  for (var i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on('fork', function(worker){
    console.log('forked worker ' + worker.id);
  });

  cluster.on('exit', function(worker, code, signal){
    console.log('worker ' + worker.process.pid + ' died');
  }); 

} else {

  var app = require('express')()
    , server = require('http').Server(app)
    , io = require('socket.io')(server)
  ;

  io.adapter(redis({ host: 'localhost', port: 6379 }));
  
  app.set('port', process.env.PORT || 3000);

  app.get('/', function(req, res){
    res.send('Server running');
  });

  require('./socketio')(io);

  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
  
}

process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
});