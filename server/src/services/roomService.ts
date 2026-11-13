import { DataStore } from './store';
import { RuleSetFactory } from '../../../shared/src/rules/RuleSetFactory';
import { LudoBoard } from '../../../shared/src/engine/LudoBoard';
import { LudoGame } from '../../../shared/src/engine/LudoGame';
import type { GameMode, RoomDetails, RoomParticipant } from '../../../shared/src/types';

export class RoomService {
  private static activeGames = new Map<string, LudoGame>(); // roomId -> LudoGame

  public static getActiveGame(roomId: string): LudoGame | undefined {
    return this.activeGames.get(roomId);
  }

  public static setActiveGame(roomId: string, game: LudoGame): void {
    this.activeGames.set(roomId, game);
  }

  public static deleteActiveGame(roomId: string): void {
    this.activeGames.delete(roomId);
  }

  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RL';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public static createRoom(
    hostId: string,
    mode: GameMode = 'classic',
    playerCount: 2 | 4 = 4,
    entryFee = 500
  ): RoomDetails {
    const hostProfile = DataStore.profiles.get(hostId);
    if (!hostProfile) throw new Error('Host profile not found.');

    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let code = this.generateRoomCode();
    while (DataStore.roomCodes.has(code)) {
      code = this.generateRoomCode();
    }

    const rules = RuleSetFactory.getRules(mode, playerCount);
    const hostParticipant: RoomParticipant = {
      userId: hostId,
      username: hostProfile.username,
      avatarUrl: hostProfile.avatarUrl,
      avatarFrame: hostProfile.avatarFrame,
      seatIndex: 0,
      color: LudoBoard.getColorForSeat(0),
      isReady: true,
      isHost: true,
      isBot: false,
    };

    const room: RoomDetails = {
      id: roomId,
      code,
      hostId,
      mode,
      playerCount,
      rules,
      entryFee,
      prizePool: entryFee * playerCount * 0.9, // 10% royal treasury cut
      participants: [hostParticipant],
      status: 'waiting',
    };

    DataStore.rooms.set(roomId, room);
    DataStore.roomCodes.set(code, roomId);

    return room;
  }

  public static joinRoom(userId: string, roomCode: string): RoomDetails {
    const normalizedCode = roomCode.trim().toUpperCase();
    const roomId = DataStore.roomCodes.get(normalizedCode);
    if (!roomId) throw new Error(`Room with code '${normalizedCode}' not found.`);

    const room = DataStore.rooms.get(roomId);
    if (!room) throw new Error('Room record missing.');

    if (room.status !== 'waiting') {
      throw new Error('This match has already started.');
    }

    // Check if already in room
    const existing = room.participants.find((p) => p.userId === userId);
    if (existing) return room;

    if (room.participants.length >= room.playerCount) {
      throw new Error('This room is full.');
    }

    const profile = DataStore.profiles.get(userId);
    if (!profile) throw new Error('User profile not found.');

    // Find first vacant seat
    const occupiedSeats = new Set(room.participants.map((p) => p.seatIndex));
    const availableSeats = room.playerCount === 2 ? [0, 2] : [0, 1, 2, 3];
    const vacantSeat = availableSeats.find((s) => !occupiedSeats.has(s)) ?? 1;

    const newParticipant: RoomParticipant = {
      userId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      avatarFrame: profile.avatarFrame,
      seatIndex: vacantSeat,
      color: LudoBoard.getColorForSeat(vacantSeat),
      isReady: false,
      isHost: false,
      isBot: false,
    };

    room.participants.push(newParticipant);
    DataStore.rooms.set(roomId, room);

    return room;
  }

  public static leaveRoom(userId: string, roomId: string): { room?: RoomDetails; roomDeleted: boolean } {
    const room = DataStore.rooms.get(roomId);
    if (!room) return { roomDeleted: true };

    room.participants = room.participants.filter((p) => p.userId !== userId);

    if (room.participants.length === 0) {
      DataStore.rooms.delete(roomId);
      DataStore.roomCodes.delete(room.code);
      this.deleteActiveGame(roomId);
      return { roomDeleted: true };
    }

    // If host left, elect new host
    if (room.hostId === userId && room.participants.length > 0) {
      room.hostId = room.participants[0].userId;
      room.participants[0].isHost = true;
    }

    DataStore.rooms.set(roomId, room);
    return { room, roomDeleted: false };
  }

  public static setReady(userId: string, roomId: string, ready: boolean): RoomDetails {
    const room = DataStore.rooms.get(roomId);
    if (!room) throw new Error('Room not found.');

    const participant = room.participants.find((p) => p.userId === userId);
    if (!participant) throw new Error('Participant not in room.');

    participant.isReady = ready;
    DataStore.rooms.set(roomId, room);
    return room;
  }

  public static startGame(roomId: string): { room: RoomDetails; game: LudoGame } {
    const room = DataStore.rooms.get(roomId);
    if (!room) throw new Error('Room not found.');

    // If any seats unfilled, fill with autonomous AI bots
    const occupiedSeats = new Set(room.participants.map((p) => p.seatIndex));
    const requiredSeats = room.playerCount === 2 ? [0, 2] : [0, 1, 2, 3];

    for (const seat of requiredSeats) {
      if (!occupiedSeats.has(seat)) {
        const botName = `Bot ${LudoBoard.getColorForSeat(seat)}`;
        room.participants.push({
          userId: `bot_${seat}_${Date.now()}`,
          username: botName,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${botName}`,
          avatarFrame: 'frame_royal_gold',
          seatIndex: seat,
          color: LudoBoard.getColorForSeat(seat),
          isReady: true,
          isHost: false,
          isBot: true,
        });
      }
    }

    room.status = 'in_game';
    DataStore.rooms.set(roomId, room);

    // Initialize authoritative LudoGame instance
    const playersConfig = room.participants.map((p) => ({
      id: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      avatarFrame: p.avatarFrame,
      isBot: p.isBot,
    }));

    const game = new LudoGame(roomId, playersConfig, room.rules);
    this.setActiveGame(roomId, game);

    return { room, game };
  }
}
