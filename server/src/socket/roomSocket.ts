import type { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService';
import { MatchmakingService } from '../services/matchmakingService';
import { DataStore } from '../services/store';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/src/types';

export class RoomSocketHandler {
  public static register(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    userId: string
  ): void {
    // 1. CREATE ROOM
    socket.on('room:create', ({ mode, playerCount, entryFee }, callback) => {
      try {
        const room = RoomService.createRoom(userId, mode, playerCount, entryFee);
        socket.join(room.id);
        callback({ success: true, room });
        io.to(room.id).emit('room:updated', room);
      } catch (err: any) {
        callback({ success: false, error: err.message });
      }
    });

    // 2. JOIN ROOM
    socket.on('room:join', ({ roomCode }, callback) => {
      try {
        const room = RoomService.joinRoom(userId, roomCode);
        socket.join(room.id);
        callback({ success: true, room });
        io.to(room.id).emit('room:updated', room);
      } catch (err: any) {
        callback({ success: false, error: err.message });
      }
    });

    // 3. READY STATUS
    socket.on('room:ready', ({ ready }) => {
      try {
        const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
        if (!roomId) return;
        const updatedRoom = RoomService.setReady(userId, roomId, ready);
        io.to(roomId).emit('room:updated', updatedRoom);
      } catch (err: any) {
        socket.emit('error:message', { message: err.message });
      }
    });

    // 4. START GAME
    socket.on('room:start', () => {
      try {
        const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
        if (!roomId) throw new Error('Not in a room.');

        const room = DataStore.rooms.get(roomId);
        if (!room || room.hostId !== userId) {
          throw new Error('Only the table host can start the match.');
        }

        const { game } = RoomService.startGame(roomId);
        const initialState = game.getState();

        io.to(roomId).emit('room:started', {
          matchId: roomId,
          state: initialState,
        });

        io.to(roomId).emit('game:turn_change', {
          currentSeat: initialState.currentTurnSeat,
          turnTimer: initialState.rules.turnTimerSeconds,
        });
      } catch (err: any) {
        socket.emit('error:message', { message: err.message });
      }
    });

    // 5. MATCHMAKING
    socket.on('matchmaking:queue', ({ mode, playerCount, entryFee }) => {
      MatchmakingService.enqueue({
        userId,
        socketId: socket.id,
        mode,
        playerCount,
        entryFee,
        joinedAt: Date.now(),
      });

      // Check for match
      const result = MatchmakingService.findMatch({
        userId,
        socketId: socket.id,
        mode,
        playerCount,
        entryFee,
        joinedAt: Date.now(),
      });

      if (result) {
        for (const ticket of result.matchedTickets) {
          io.to(ticket.socketId).emit('matchmaking:found', {
            roomCode: result.room.code,
          });
        }
      }
    });

    socket.on('matchmaking:cancel', () => {
      MatchmakingService.dequeue(userId);
    });

    // 6. LEAVE ROOM
    socket.on('room:leave', () => {
      const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
      if (roomId) {
        socket.leave(roomId);
        const { room, roomDeleted } = RoomService.leaveRoom(userId, roomId);
        if (!roomDeleted && room) {
          io.to(roomId).emit('room:updated', room);
        }
      }
    });
  }
}
