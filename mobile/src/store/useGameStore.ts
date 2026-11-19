import { create } from 'zustand';
import { LudoGame, type GameInitPlayer } from '../../../shared/src/engine/LudoGame';
import { RuleSetFactory } from '../../../shared/src/rules/RuleSetFactory';
import type { GameMode, GameRules, GameState, Player, ValidMove } from '../../../shared/src/types';

interface GameStoreState {
  game: LudoGame | null;
  gameState: GameState | null;
  isRolling: boolean;
  selectedTokenId: number | null;
  lastDiceRoll: number | null;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  botDifficulty: 'easy' | 'medium' | 'hard';
  firstTurnAnnouncement: string | null;
  gameSpeed: 1 | 2;
  boardColorOffset: number;

  // Actions
  startNewGame: (config: {
    mode: GameMode;
    playerCount: 2 | 4;
    players: GameInitPlayer[];
    rules?: Partial<GameRules>;
    botDifficulty?: 'easy' | 'medium' | 'hard';
    randomizeTurn?: boolean;
    startingSeat?: number;
  }) => void;
  rollDice: (seatIndex: number, injectedRoll?: number) => void;
  selectAndMoveToken: (seatIndex: number, tokenId: number) => void;
  usePowerUp: (
    seatIndex: number,
    type: 'REROLL' | 'MAGIC_SIX' | 'SHIELD',
    targetTokenId?: number
  ) => { success: boolean; message: string };
  triggerBotTurn: () => void;
  syncOnlineState: (serverState: GameState) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleGameSpeed: () => void;
  resetGame: () => void;
}

function areAllMovesEquivalent(moves: ValidMove[]): boolean {
  if (moves.length === 0) return false;
  if (moves.length === 1) return true;
  const firstKey = `${moves[0].fromStep}_${moves[0].toStep}`;
  return moves.every((m) => `${m.fromStep}_${m.toStep}` === firstKey);
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  game: null,
  gameState: null,
  isRolling: false,
  selectedTokenId: null,
  lastDiceRoll: null,
  soundEnabled: true,
  vibrationEnabled: true,
  botDifficulty: 'medium',
  firstTurnAnnouncement: null,
  gameSpeed: 1,
  boardColorOffset: 0,

  startNewGame: ({ mode, playerCount, players, rules, botDifficulty, randomizeTurn, startingSeat }) => {
    const fullRules = RuleSetFactory.getRules(mode, playerCount, rules);
    const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const game = new LudoGame(matchId, players, fullRules);

    if (typeof startingSeat === 'number') {
      game.setStartingSeat(startingSeat);
    } else if (randomizeTurn) {
      game.randomizeStartingTurn();
    }

    // Rotate board colors on every new match so you don't always play the same home color (Ludo Star style!)
    const prevOffset = get().boardColorOffset;
    const colorChoices = [0, 1, 2, 3].filter((o) => o !== prevOffset);
    const nextColorOffset = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    const colorOrder: Array<'RED' | 'GREEN' | 'YELLOW' | 'BLUE'> = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const myColorName = colorOrder[nextColorOffset];

    const initialState = game.getState();
    const firstPlayer = initialState.players.find((p) => p.seatIndex === initialState.currentTurnSeat);
    const firstVisualColor = firstPlayer ? colorOrder[(firstPlayer.seatIndex + nextColorOffset) % 4] : myColorName;
    const announcement = firstPlayer
      ? firstPlayer.seatIndex === 0
        ? `🎨 You are ${myColorName}! · 🎲 ${firstPlayer.username} rolls first!`
        : `🎨 You are ${myColorName}! · 🎲 ${firstPlayer.username} (${firstVisualColor}) rolls first!`
      : null;

    set({
      game,
      gameState: initialState,
      isRolling: false,
      selectedTokenId: null,
      lastDiceRoll: null,
      botDifficulty: botDifficulty || 'medium',
      firstTurnAnnouncement: announcement,
      boardColorOffset: nextColorOffset,
    });

    if (firstPlayer && firstPlayer.isBot) {
      setTimeout(() => {
        if (get().game?.getState().matchId === matchId) {
          get().triggerBotTurn();
        }
      }, 650);
    }
  },

  rollDice: (seatIndex, injectedRoll) => {
    const { game, isRolling } = get();
    if (!game || isRolling) return;
    const targetMatchId = game.getState().matchId;
    const speedFactor = get().gameSpeed === 2 ? 0.5 : 1;

    set({ isRolling: true });

    setTimeout(() => {
      try {
        const activeGame = get().game;
        if (!activeGame || activeGame.getState().matchId !== targetMatchId) return;

        const rollRes = activeGame.rollDice(seatIndex, injectedRoll);
        set({
          isRolling: false,
          lastDiceRoll: rollRes.diceValue,
          gameState: activeGame.getState(),
        });

        // If turn automatically passed, check if next player is bot
        if (rollRes.turnPassed) {
          get().triggerBotTurn();
        } else if (areAllMovesEquivalent(rollRes.validMoves)) {
          // If only 1 distinct move exists (e.g., 1 valid token OR all valid tokens in base/stacked on same square), auto-move smoothly!
          setTimeout(() => {
            if (get().game?.getState().matchId === targetMatchId) {
              get().selectAndMoveToken(seatIndex, rollRes.validMoves[0].tokenId);
            }
          }, Math.round(180 * speedFactor));
        }
      } catch (e) {
        console.warn('Roll error:', e);
        set({ isRolling: false });
      }
    }, Math.round(210 * speedFactor));
  },

  selectAndMoveToken: (seatIndex, tokenId) => {
    const { game } = get();
    if (!game) return;
    const targetMatchId = game.getState().matchId;
    const speedFactor = get().gameSpeed === 2 ? 0.55 : 1;

    try {
      game.moveToken(seatIndex, tokenId);
      set({
        selectedTokenId: tokenId,
        gameState: game.getState(),
      });

      // Clear selection after animation
      setTimeout(() => {
        if (get().game?.getState().matchId !== targetMatchId) return;
        set({ selectedTokenId: null });
        // Check if next player is a bot
        get().triggerBotTurn();
      }, Math.round(220 * speedFactor));
    } catch (e) {
      console.warn('Move error:', e);
    }
  },

  usePowerUp: (seatIndex, type, targetTokenId) => {
    const { game } = get();
    if (!game) return { success: false, message: 'No active game.' };
    const targetMatchId = game.getState().matchId;

    const res = game.usePowerUp(seatIndex, type, targetTokenId);
    if (res.success) {
      set({
        gameState: game.getState(),
        lastDiceRoll: res.diceValue ?? get().lastDiceRoll,
      });

      if (type === 'REROLL' && res.validMoves && areAllMovesEquivalent(res.validMoves)) {
        setTimeout(() => {
          if (get().game?.getState().matchId === targetMatchId) {
            get().selectAndMoveToken(seatIndex, res.validMoves![0].tokenId);
          }
        }, 350);
      } else if (type === 'REROLL' && res.validMoves && res.validMoves.length === 0) {
        get().triggerBotTurn();
      }
    }
    return res;
  },

  triggerBotTurn: () => {
    const { game } = get();
    if (!game) return;

    const state = game.getState();
    if (state.turnPhase === 'GAME_OVER') return;
    const targetMatchId = state.matchId;

    const currentPlayer = state.players.find((p) => p.seatIndex === state.currentTurnSeat);
    if (!currentPlayer || !currentPlayer.isBot) return;

    // Simulate bot dice roll animation + move
    const speedFactor = get().gameSpeed === 2 ? 0.55 : 1;
    setTimeout(() => {
      const { game: activeGame } = get();
      if (!activeGame || activeGame.getState().matchId !== targetMatchId) return;

      set({ isRolling: true });

      setTimeout(() => {
        const { game: currentActiveGame } = get();
        if (!currentActiveGame || currentActiveGame.getState().matchId !== targetMatchId) return;

        const botRes = currentActiveGame.playBotTurn(get().botDifficulty || 'medium');
        set({ isRolling: false });

        if (botRes) {
          set({
            lastDiceRoll: botRes.rolledValue,
            gameState: currentActiveGame.getState(),
          });

          if (botRes.extraTurn && !botRes.gameOver) {
            // Bot rolls again
            get().triggerBotTurn();
          } else {
            // Next player's turn
            setTimeout(() => {
              if (get().game?.getState().matchId === targetMatchId) {
                get().triggerBotTurn();
              }
            }, Math.round(240 * speedFactor));
          }
        }
      }, Math.round(220 * speedFactor));
    }, Math.round(260 * speedFactor));
  },

  syncOnlineState: (serverState) => {
    set({
      gameState: serverState,
      lastDiceRoll: serverState.currentDiceValue,
    });
  },

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
  toggleGameSpeed: () => set((s) => ({ gameSpeed: s.gameSpeed === 1 ? 2 : 1 })),
  resetGame: () => set({ game: null, gameState: null, isRolling: false }),
}));
