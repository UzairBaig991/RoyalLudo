import type { GameMode, GameRules, GameState, PlayerColor, ValidMove } from './game';

export interface RoomParticipant {
  userId: string;
  username: string;
  avatarUrl: string;
  avatarFrame: string;
  seatIndex: number;
  color: PlayerColor;
  isReady: boolean;
  isHost: boolean;
  isBot: boolean;
}

export interface RoomDetails {
  id: string;
  code: string;
  hostId: string;
  mode: GameMode;
  playerCount: 2 | 4;
  rules: GameRules;
  entryFee: number;
  prizePool: number;
  participants: RoomParticipant[];
  status: 'waiting' | 'in_game' | 'finished';
}

export interface ClientToServerEvents {
  'room:create': (data: { mode: GameMode; playerCount: 2 | 4; entryFee: number }, callback: (res: { success: boolean; room?: RoomDetails; error?: string }) => void) => void;
  'room:join': (data: { roomCode: string }, callback: (res: { success: boolean; room?: RoomDetails; error?: string }) => void) => void;
  'room:leave': () => void;
  'room:ready': (data: { ready: boolean }) => void;
  'room:start': () => void;
  'matchmaking:queue': (data: { mode: GameMode; playerCount: 2 | 4; entryFee: number }) => void;
  'matchmaking:cancel': () => void;
  'game:roll_dice': () => void;
  'game:move_token': (data: { tokenId: number }) => void;
  'game:emoji': (data: { emojiId: string }) => void;
  'game:chat': (data: { message: string }) => void;
  'game:send_gift': (data: { targetSeat: number; giftId: string }) => void;
  'game:rematch_request': () => void;
  'game:reconnect': (data: { matchId: string }) => void;
}

export interface ServerToClientEvents {
  'room:updated': (room: RoomDetails) => void;
  'room:started': (data: { matchId: string; state: GameState }) => void;
  'matchmaking:found': (data: { roomCode: string }) => void;
  'game:state': (state: GameState) => void;
  'game:dice_rolled': (data: { seatIndex: number; diceValue: number; validMoves: ValidMove[]; extraTurn: boolean }) => void;
  'game:token_moved': (data: { seatIndex: number; tokenId: number; fromStep: number; toStep: number; capturesToken?: any; extraTurn: boolean; finished: boolean }) => void;
  'game:turn_change': (data: { currentSeat: number; turnTimer: number }) => void;
  'game:finished': (data: { rankings: any[]; rewards: any[] }) => void;
  'game:emoji_reaction': (data: { seatIndex: number; emojiId: string }) => void;
  'game:chat_message': (data: { seatIndex: number; username: string; message: string }) => void;
  'game:gift_delivered': (data: { fromSeat: number; toSeat: number; giftId: string }) => void;
  'game:player_disconnected': (data: { seatIndex: number; graceSeconds: number }) => void;
  'game:player_reconnected': (data: { seatIndex: number }) => void;
  'error:message': (data: { message: string }) => void;
}
