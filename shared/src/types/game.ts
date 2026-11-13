export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type TokenState = 'BASE' | 'PATH' | 'HOME_STRETCH' | 'FINISHED';

export interface GridCoord {
  row: number; // 0 to 14
  col: number; // 0 to 14
}

export interface TokenPosition {
  state: TokenState;
  /**
   * Logical progress step:
   * - -1 = BASE
   * - 0 = Starting tile on perimeter
   * - 0..50 = 51 perimeter tiles traversed
   * - 51..55 = 5 colored home stretch tiles
   * - 56 = FINISHED (Center triangle)
   */
  step: number;
  perimeterIndex: number | null; // 0..51 when state === 'PATH'
  homeStretchIndex: number | null; // 0..4 when state === 'HOME_STRETCH'
  gridCoord: GridCoord;
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  position: TokenPosition;
}

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  avatarFrame?: string;
  diceSkin?: string;
  color: PlayerColor;
  seatIndex: number; // 0: Red, 1: Green, 2: Yellow, 3: Blue
  tokens: Token[];
  isBot: boolean;
  isDisconnected: boolean;
  teamId: number | null; // e.g. Team 0 = Red & Yellow, Team 1 = Green & Blue
  hasFinished: boolean;
  finishRank: number | null;
  tokensHome: number;
  hasKilledOpponent: boolean; // Authentic Ludo Star rule: must capture an opponent to unlock home stretch
}

export type GameMode = 'classic' | 'master' | 'quick' | 'arrow' | 'custom';

export interface GameRules {
  mode: GameMode;
  playerCount: 2 | 4;
  tokensToWin: number; // 4 in classic, 2 in quick
  turnTimerSeconds: number; // standard 15s
  allowStacking: boolean; // Master mode allows blockades
  threeSixesForfeit: boolean; // true by default
  openOnSix: boolean; // default true
  openOnOne: boolean; // for master/custom
  captureBonus: boolean; // extra turn on capture
  safeCellCoexistence: boolean; // safe stars protect from capture
  allowShortcuts?: boolean; // Arrow mode
  mustKillToEnterHome?: boolean; // Ludo Star kill requirement
  loopIfNoKill?: boolean; // If no kill, tokens loop around the board to hunt
}

export type TurnPhase = 'ROLL_DICE' | 'SELECT_TOKEN' | 'ANIMATING' | 'GAME_OVER';

export interface ValidMove {
  tokenId: number;
  fromStep: number;
  toStep: number;
  isEntry: boolean;
  isFinish: boolean;
  capturesToken: {
    color: PlayerColor;
    tokenId: number;
    seatIndex: number;
  } | null;
}

export interface GameEvent {
  type: 'DICE_ROLLED' | 'TOKEN_MOVED' | 'TOKEN_CAPTURED' | 'TOKEN_FINISHED' | 'EXTRA_TURN' | 'TURN_PASSED' | 'PLAYER_WON';
  seatIndex: number;
  payload: any;
  timestamp: number;
}

export interface GameState {
  matchId: string;
  mode: GameMode;
  rules: GameRules;
  players: Player[];
  activePlayerSeats: number[];
  currentTurnSeat: number;
  currentDiceValue: number | null;
  consecutiveSixes: number;
  validMoves: ValidMove[];
  turnPhase: TurnPhase;
  turnStartTime: number;
  winner: PlayerColor | null;
  rankings: {
    seatIndex: number;
    color: PlayerColor;
    username: string;
    rank: number;
  }[];
  history: GameEvent[];
}
