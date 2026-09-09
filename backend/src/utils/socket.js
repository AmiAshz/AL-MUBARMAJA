const socketIo = require('socket.io');

let io;

const allowedOrigins = [
  'http://localhost:3000',
  'https://al-mubarmaja.ameenaamiaan.workers.dev',
  process.env.APP_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      return {
        emit: () => {},
        to: () => ({ emit: () => {} }),
        in: () => ({ emit: () => {} })
      };
    }
    return io;
  }
};
