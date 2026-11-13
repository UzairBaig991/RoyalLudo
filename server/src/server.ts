import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { CONFIG } from './config/env';
import { RoyalApp } from './app';
import { DataStore } from './services/store';
import { SocketHandler } from './socket/socketHandler';

// Initialize seed data
DataStore.initializeSeed();

const httpServer = createServer((req, res) => {
  RoyalApp.handleRequest(req, res);
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

SocketHandler.init(io);

httpServer.listen(CONFIG.port, () => {
  console.log('====================================================');
  console.log(`👑 ROYAL LUDO GAME & SERVER ACTIVE ON PORT ${CONFIG.port}`);
  console.log(`🎮 PLAY GAME IN BROWSER: http://localhost:${CONFIG.port}/`);
  console.log(`🎮 DIRECT GAME LINK:     http://localhost:${CONFIG.port}/play`);
  console.log(`📡 SERVER STATUS:        http://localhost:${CONFIG.port}/health`);
  console.log('====================================================');
});
