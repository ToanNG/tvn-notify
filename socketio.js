exports = module.exports = function(io){
  io.on('connection', function(socket){
  
    socket.on('user join', function(user){
      console.error((new Date).toUTCString() + ' user ' + user.id + ' connected');

      var rooms;

      socket.user = user;

      switch (user.role) {
        case 'employer':
          rooms = ['ad-em', 'em-se'];
          break;
        case 'seeker':
          rooms = ['ad-se', 'em-se'];
          break;
        case 'admin':
          rooms = ['ad-em', 'ad-se'];
          break;
      }

      if (!rooms) {
        socket.emit('connect error', 'User fails joining room');
        return;
      }

      rooms.forEach(function(room){
        socket.join(room);
      });
    });

    socket.on('notify', function(message, receiverId, receiverRole){
      var room;

      // force half-duplex
      if (socket.user.role === 'admin' && receiverRole === 'employer') {
        room = 'ad-em';
      } else if (socket.user.role === 'admin' && receiverRole === 'seeker') {
        room = 'ad-se';
      } else if (socket.user.role === 'employer' && receiverRole === 'seeker' || 
                 socket.user.role === 'seeker' && receiverRole === 'employer') {
        room = 'em-se';
      }

      if (room) {
        socket.broadcast.to(room).emit('notify', message, receiverId);
      }
    });

    socket.on('disconnect', function(){
      console.error((new Date).toUTCString() + ' user ' + socket.user.id + ' disconnected');
    });

  });
};