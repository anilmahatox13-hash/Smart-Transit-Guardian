const socketio = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    socket.on('join_bus', (busId) => {
      socket.join(`bus_${busId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };