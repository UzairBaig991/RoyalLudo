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

  // Actions
  startNewGame: (config: {
    mode: GameMode;
    playerCount: 2 | 4;
    players: GameInitPlayer[];
    rules?: Partial<GameRules>;
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
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  game: null,
  gameState: null,
  isRolling: false,
  selectedTokenId: null,
  lastDiceRoll: null,
  soundEnabled: true,
  vibrationEnabled: true,

  startNewGame: ({ mode, playerCount, players, rules }) => {
    const fullRules = RuleSetFactory.getRules(mode, playerCount, rules);
    const game = new LudoGame(`match_${Date.now()}`, players, fullRules);
    set({
      game,
      gameState: game.getState(),
      isRolling: false,
      selectedTokenId: null,
      lastDiceRoll: null,
    });
  },

  rollDice: (seatIndex, injectedRoll) => {
    const { game, isRolling } = get();
    if (!game || isRolling) return;

    set({ isRolling: true });

    setTimeout(() => {
      try {
        const rollRes = game.rollDice(seatIndex, injectedRoll);
        set({
          isRolling: false,
          lastDiceRoll: rollRes.diceValue,
          gameState: game.getState(),
        });

        // If turn automatically passed, check if next player is bot
        if (rollRes.turnPassed) {
          get().triggerBotTurn();
        } else if (rollRes.validMoves.length === 1) {
          // If exactly 1 move available, auto-execute after brief 300ms delay for smooth UX
          setTimeout(() => {
            get().selectAndMoveToken(seatIndex, rollRes.validMoves[0].tokenId);
          }, 350);
        }
      } catch (e) {
        console.warn('Roll error:', e);
        set({ isRolling: false });
      }
    }, 450); // 450ms dice rolling animation duration
  },

  selectAndMoveToken: (seatIndex, tokenId) => {
    const { game } = get();
    if (!game) return;

    try {
      const moveRes = game.moveToken(seatIndex, tokenId);
      set({
        selectedTokenId: tokenId,
        gameState: game.getState(),
      });

      // Clear selection after animation
      setTimeout(() => {
        set({ selectedTokenId: null });
        // Check if next player is a bot
        get().triggerBotTurn();
      }, 500);
    } catch (e) {
      console.warn('Move error:', e);
    }
  },

  usePowerUp: (seatIndex, type, targetTokenId) => {
    const { game } = get();
    if (!game) return { success: false, message: 'No active game.' };

    const res = game.usePowerUp(seatIndex, type, targetTokenId);
    if (res.success) {
      set({
        gameState: game.getState(),
        lastDiceRoll: res.diceValue ?? get().lastDiceRoll,
      });

      if (type === 'REROLL' && res.validMoves && res.validMoves.length === 1) {
        setTimeout(() => {
          get().selectAndMoveToken(seatIndex, res.validMoves![0].tokenId);
        }, 350);
      }
    }
    return res;
  },

  triggerBotTurn: () => {
    const { game } = get();
    if (!game) return;

    const state = game.getState();
    if (state.turnPhase === 'GAME_OVER') return;

    const currentPlayer = state.players.find((p) => p.seatIndex === state.currentTurnSeat);
    if (!currentPlayer || !currentPlayer.isBot) return;

    // Simulate 700ms bot reaction time
    setTimeout(() => {
      const { game: activeGame } = get();
      if (!activeGame) return;

      const botRes = activeGame.playBotTurn('medium');
      if (botRes) {
        set({
          lastDiceRoll: botRes.rolledValue,
          gameState: activeGame.getState(),
        });

        if (botRes.extraTurn && !botRes.gameOver) {
          // Bot rolls again
          get().triggerBotTurn();
        } else {
          // Next player's turn
          setTimeout(() => {
            get().triggerBotTurn();
          }, 400);
        }
      }
    }, 700);
  },

  syncOnlineState: (serverState) => {
    set({
      gameState: serverState,
      lastDiceRoll: serverState.currentDiceValue,
    });
  },

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
  resetGame: () => set({ game: null, gameState: null, isRolling: false }),
}));
