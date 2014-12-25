exports = module.exports = function(io){
  var clients = {};

  io.on('connection', function(socket){
  
    socket.on('user join', function(user){
      if (!user || !user.id) {
        return socket.emit('connect error', 'User fails connecting');
      }

      console.log((new Date).toUTCString() + ' user ' + user.id + ' connected');

      socket.user = user;
      clients[socket.user.id] = socket.id;
    });

    socket.on('notify', function(message, receiverId){
      if (!socket.user) {
        return socket.emit('connect error', 'User fails sending message');
      }

      console.log((new Date).toUTCString() + ' user ' + socket.user.id + ' sent message to user ' + receiverId);

      var socketId = clients[receiverId];
      if (socketId) {
        io.to(socketId).emit('notify', message, socket.user);
      }
    });

    socket.on('disconnect', function(){
      console.log((new Date).toUTCString() + ' user ' + socket.user.id + ' disconnected');

      clients[socket.user.id] = undefined;
    });

  });
};