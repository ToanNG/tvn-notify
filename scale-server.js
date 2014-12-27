var cluster = require('cluster')
  , express = require('express')
  , net = require('net')
  , sio = require('socket.io')
  , sio_redis = require('socket.io-redis')
;

var port = process.env.PORT || 3000
  , numCPUs = require('os').cpus().length
;

if (cluster.isMaster) {

  var workers = [];

  var spawn = function(i){
    workers[i] = cluster.fork();
    console.log('worker %s started.', i);

    workers[i].on('exit', function(worker, code, signal){
      console.log('respawning worker', i);
      spawn(i);
    });
  };

  for (var i = 0; i < numCPUs; i += 1) {
    spawn(i);
  }

  var worker_index = function(ip, len){
    var s = '';
    for (var i = 0, _len = ip.length; i < _len; i++) {
      if (ip[i] !== '.') {
        s += ip[i];
      }
    }

    return Number(s) % len;
  };

  var server = net.createServer(function(connection){
    var worker = workers[worker_index(connection.remoteAddress, numCPUs)];
    worker.send('sticky-session:connection', connection);
  }).listen(port);

} else {

  var app = new express()
    , server = app.listen(0, 'localhost')
    , io = sio(server)
  ;

  io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
  
  app.get('/', function(req, res){
    res.send('Server running');
  });

  require('./socketio')(io);

  process.on('message', function(message, connection){
    if (message !== 'sticky-session:connection') {
      return;
    }

    server.emit('connection', connection);
  });

  process.on('uncaughtException', function(err){
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    process.exit(1);
  });

}