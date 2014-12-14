var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
  res.send('<h1>Server is running</h1>');
});

io.on('connection', function(socket){
  
	socket.on('user join', function(user){
		var rooms;

		socket.user = user;

		switch (user.role) {
			case 'nhatuyendung':
				rooms = ['ad-ntd', 'ntd-ntv'];
				break;
			case 'nguoitimviec':
				rooms = ['ad-ntv', 'ntd-ntv'];
				break;
			case 'admin':
				rooms = ['ad-ntd', 'ad-ntv'];
				break;
		}

		if (!rooms) {
			socket.emit('connect error', 'User is not in any channel.');
			return;
		}

		rooms.forEach(function(room){
			socket.join(room);
		});
	});

	socket.on('notify', function(message, receiverId, receiverRole){
		var room;

		// force half-duplex
		if (socket.user.role === 'admin' && receiverRole === 'nhatuyendung') {
			room = 'ad-ntd';
		} else if (socket.user.role === 'admin' && receiverRole === 'nguoitimviec') {
			room = 'ad-ntv';
		} else if (socket.user.role === 'nhatuyendung' && receiverRole === 'nguoitimviec' || 
							 socket.user.role === 'nguoitimviec' && receiverRole === 'nhatuyendung') {
			room = 'ntd-ntv';
		}

		if (room) {
			socket.broadcast.to(room).emit('notify', message, receiverId);
		}
	});

  socket.on('disconnect', function(){
  	console.log('user disconnected');
  });
});

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});