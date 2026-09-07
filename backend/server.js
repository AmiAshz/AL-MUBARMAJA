require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const socket = require('./src/utils/socket');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('[DATABASE] Successfully connected to MySQL');
    const server = http.createServer(app);
    const io = socket.init(server);

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });
    
    server.listen(PORT, () => {
      console.log(`[SERVER] Vantara Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER ERROR] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
