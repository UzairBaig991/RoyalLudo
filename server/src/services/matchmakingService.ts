import { RoomService } from './roomService';
import type { GameMode, RoomDetails } from '../../../shared/src/types';

export interface MatchmakingTicket {
  userId: string;
  socketId: string;
  mode: GameMode;
  playerCount: 2 | 4;
  entryFee: number;
  joinedAt: number;
}

export class MatchmakingService {
  private static queue: MatchmakingTicket[] = [];

  public static enqueue(ticket: MatchmakingTicket): void {
    this.dequeue(ticket.userId);
    this.queue.push(ticket);
  }

  public static dequeue(userId: string): void {
    this.queue = this.queue.filter((t) => t.userId !== userId);
  }

  public static findMatch(ticket: MatchmakingTicket): { room: RoomDetails; matchedTickets: MatchmakingTicket[] } | null {
    // Include the checking ticket if not already in queue
    if (!this.queue.some((t) => t.userId === ticket.userId)) {
      this.queue.push(ticket);
    }

    const candidates = this.queue.filter(
      (t) =>
        t.mode === ticket.mode &&
        t.playerCount === ticket.playerCount &&
        t.entryFee === ticket.entryFee
    );

    // If we have enough players
    if (candidates.length >= ticket.playerCount) {
      const matched = candidates.slice(0, ticket.playerCount);
      for (const m of matched) {
        this.dequeue(m.userId);
      }

      const host = matched[0];
      const room = RoomService.createRoom(host.userId, host.mode, host.playerCount, host.entryFee);

      for (let i = 1; i < matched.length; i++) {
        RoomService.joinRoom(matched[i].userId, room.code);
      }

      return { room, matchedTickets: matched };
    }

    // Timeout fallback (> 6s)
    const now = Date.now();
    if (now - ticket.joinedAt > 6000) {
      this.dequeue(ticket.userId);
      const room = RoomService.createRoom(ticket.userId, ticket.mode, ticket.playerCount, ticket.entryFee);
      return { room, matchedTickets: [ticket] };
    }

    return null;
  }
}
