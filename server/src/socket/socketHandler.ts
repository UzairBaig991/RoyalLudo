import type { Server, Socket } from 'socket.io';
import { AuthService } from '../services/authService';
import { DataStore } from '../services/store';
import { GameSocketHandler } from './gameSocket';
import { RoomSocketHandler } from './roomSocket';
import { RoomService } from '../services/roomService';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/src/types';

export class SocketHandler {
  public static init(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== 'string') {
        // Allow anonymous guest handshake
        const guest = AuthService.guestLogin();
        (socket as any).userId = guest.user.id;
        return next();
      }

      const verified = AuthService.verifyToken(token);
      if (verified) {
        (socket as any).userId = verified.userId;
        return next();
      }

      // Fallback to guest if token expired
      const fallbackGuest = AuthService.guestLogin();
      (socket as any).userId = fallbackGuest.user.id;
      next();
    });

    io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      const userId = (socket as any).userId as string;
      DataStore.onlineSockets.set(userId, socket.id);
      DataStore.socketToUser.set(socket.id, userId);

      console.log(`[Socket] User connected: ${userId} (${socket.id})`);

      // Register feature socket handlers
      RoomSocketHandler.register(io, socket, userId);
      GameSocketHandler.register(io, socket, userId);

      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${userId}`);
        DataStore.onlineSockets.delete(userId);
        DataStore.socketToUser.delete(socket.id);

        // Check if user was in active room
        for (const room of DataStore.rooms.values()) {
          const participant = room.participants.find((p) => p.userId === userId);
          if (participant && room.status === 'in_game') {
            io.to(room.id).emit('game:player_disconnected', {
              seatIndex: participant.seatIndex,
              graceSeconds: 30,
            });
          }
        }
      });
    });
  }
}
