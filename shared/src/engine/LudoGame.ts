import { DEFAULT_RULES } from '../constants/rules';
import type {
  GameEvent,
  GameMode,
  GameRules,
  GameState,
  Player,
  PlayerColor,
  Token,
  ValidMove,
} from '../types/game';
import { BotAI, type BotDifficulty } from './BotAI';
import { DiceRoller } from './DiceRoller';
import { LudoBoard } from './LudoBoard';
import { MoveValidator } from './MoveValidator';
import { PathCalculator } from './PathCalculator';

export interface GameInitPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  avatarFrame?: string;
  diceSkin?: string;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
  teamId?: number | null;
}

export class LudoGame {
  private state: GameState;
  private customRng?: () => number;

  constructor(
    matchId: string,
    playersConfig: GameInitPlayer[],
    rulesOverride?: Partial<GameRules>,
    customRng?: () => number
  ) {
    this.customRng = customRng;
    const mode: GameMode = rulesOverride?.mode || 'classic';
    const rules: GameRules = {
      ...DEFAULT_RULES[mode],
      ...rulesOverride,
      playerCount: (playersConfig.length === 2 ? 2 : 4) as 2 | 4,
    };

    const playerCount = rules.playerCount;
    const activePlayerSeats: number[] = playerCount === 2 ? [0, 2] : [0, 1, 2, 3];

    const players: Player[] = activePlayerSeats.map((seatIndex, idx) => {
      const cfg = playersConfig[idx] || {
        id: `bot_${seatIndex}`,
        username: `Bot ${seatIndex + 1}`,
        isBot: true,
      };

      const color = LudoBoard.getColorForSeat(seatIndex);
      const tokens: Token[] = [0, 1, 2, 3].map((tokenId) => ({
        id: tokenId,
        color,
        position: LudoBoard.createTokenPosition(color, tokenId, -1),
      }));

      return {
        id: cfg.id,
        username: cfg.username,
        avatarUrl: cfg.avatarUrl || `https://api.dicebear.com/7.x/bottts/png?seed=${cfg.username}`,
        avatarFrame: cfg.avatarFrame || 'frame_royal_gold',
        diceSkin: cfg.diceSkin || 'dice_classic_gold',
        color,
        seatIndex,
        tokens,
        isBot: !!cfg.isBot,
        isDisconnected: false,
        teamId: cfg.teamId ?? (mode === 'classic' ? null : Math.floor(seatIndex % 2)),
        hasFinished: false,
        finishRank: null,
        tokensHome: 0,
        hasKilledOpponent: false,
      };
    });

    this.state = {
      matchId,
      mode,
      rules,
      players,
      activePlayerSeats,
      currentTurnSeat: activePlayerSeats[0],
      currentDiceValue: null,
      consecutiveSixes: 0,
      validMoves: [],
      turnPhase: 'ROLL_DICE',
      turnStartTime: Date.now(),
      winner: null,
      rankings: [],
      history: [],
    };
  }

  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public randomizeStartingTurn(): number {
    const seats = this.state.activePlayerSeats;
    const rngVal = this.customRng ? this.customRng() : Math.random();
    const randomIndex = Math.floor(rngVal * seats.length);
    const chosenSeat = seats[randomIndex] ?? seats[0];
    this.state.currentTurnSeat = chosenSeat;
    this.state.turnStartTime = Date.now();
    return chosenSeat;
  }

  public setStartingSeat(seatIndex: number): void {
    if (this.state.activePlayerSeats.includes(seatIndex)) {
      this.state.currentTurnSeat = seatIndex;
      this.state.turnStartTime = Date.now();
    }
  }

  public getCurrentPlayer(): Player {
    const player = this.state.players.find((p) => p.seatIndex === this.state.currentTurnSeat);
    if (!player) throw new Error(`Active player not found for seat ${this.state.currentTurnSeat}`);
    return player;
  }

  public rollDice(seatIndex: number, injectedRoll?: number): {
    diceValue: number;
    validMoves: ValidMove[];
    turnPassed: boolean;
    forfeited: boolean;
  } {
    if (this.state.turnPhase !== 'ROLL_DICE') {
      throw new Error(`Cannot roll dice in phase: ${this.state.turnPhase}`);
    }
    if (seatIndex !== this.state.currentTurnSeat) {
      throw new Error(`It is not seat ${seatIndex}'s turn. Current turn: ${this.state.currentTurnSeat}`);
    }

    const diceValue = injectedRoll ?? DiceRoller.roll(this.customRng);
    this.state.currentDiceValue = diceValue;

    const evalSixes = DiceRoller.evaluateConsecutiveSixes(
      this.state.consecutiveSixes,
      diceValue,
      this.state.rules.threeSixesForfeit
    );
    this.state.consecutiveSixes = evalSixes.newCount;

    this.recordEvent('DICE_ROLLED', seatIndex, {
      diceValue,
      consecutiveSixes: this.state.consecutiveSixes,
      forfeited: evalSixes.forfeited,
    });

    if (evalSixes.forfeited) {
      this.advanceTurn();
      return {
        diceValue,
        validMoves: [],
        turnPassed: true,
        forfeited: true,
      };
    }

    const player = this.getCurrentPlayer();
    const validMoves = MoveValidator.getValidMoves(
      player,
      diceValue,
      this.state.players,
      this.state.rules
    );

    this.state.validMoves = validMoves;

    if (validMoves.length === 0) {
      this.state.consecutiveSixes = 0;
      this.advanceTurn();
      return {
        diceValue,
        validMoves: [],
        turnPassed: true,
        forfeited: false,
      };
    }

    this.state.turnPhase = 'SELECT_TOKEN';
    return {
      diceValue,
      validMoves,
      turnPassed: false,
      forfeited: false,
    };
  }

  public moveToken(seatIndex: number, tokenId: number): {
    movedTokenId: number;
    fromStep: number;
    toStep: number;
    capturedToken: ValidMove['capturesToken'];
    extraTurn: boolean;
    playerFinished: boolean;
    gameOver: boolean;
  } {
    if (this.state.turnPhase !== 'SELECT_TOKEN') {
      throw new Error(`Cannot move token in phase: ${this.state.turnPhase}`);
    }
    if (seatIndex !== this.state.currentTurnSeat) {
      throw new Error(`It is not seat ${seatIndex}'s turn.`);
    }

    const validMove = this.state.validMoves.find((m) => m.tokenId === tokenId);
    if (!validMove) {
      throw new Error(`Token ${tokenId} is not a valid move.`);
    }

    const player = this.getCurrentPlayer();
    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token) throw new Error(`Token ${tokenId} not found.`);

    const fromStep = validMove.fromStep;
    const toStep = validMove.toStep;

    token.position = LudoBoard.createTokenPosition(player.color, tokenId, toStep);

    this.recordEvent('TOKEN_MOVED', seatIndex, {
      tokenId,
      fromStep,
      toStep,
    });

    let extraTurnAwarded = false;

    if (validMove.capturesToken) {
      player.hasKilledOpponent = true;
      const cap = validMove.capturesToken;
      const opponent = this.state.players.find((p) => p.seatIndex === cap.seatIndex);
      if (opponent) {
        const opponentToken = opponent.tokens.find((t) => t.id === cap.tokenId);
        if (opponentToken) {
          opponentToken.position = LudoBoard.createTokenPosition(opponent.color, opponentToken.id, -1);
          this.recordEvent('TOKEN_CAPTURED', seatIndex, cap);
          this.recordEvent('KILL_ACHIEVED', seatIndex, { color: player.color });
          if (this.state.rules.captureBonus) {
            extraTurnAwarded = true;
          }
        }
      }
    }

    let playerFinishedNow = false;
    if (validMove.isFinish) {
      player.tokensHome += 1;
      extraTurnAwarded = true;
      this.recordEvent('TOKEN_FINISHED', seatIndex, {
        tokenId,
        tokensHome: player.tokensHome,
      });

      if (player.tokensHome >= this.state.rules.tokensToWin) {
        player.hasFinished = true;
        playerFinishedNow = true;
        const currentRank = this.state.rankings.length + 1;
        player.finishRank = currentRank;

        this.state.rankings.push({
          seatIndex: player.seatIndex,
          color: player.color,
          username: player.username,
          rank: currentRank,
        });

        if (this.state.winner === null) {
          this.state.winner = player.color;
        }

        this.recordEvent('PLAYER_WON', seatIndex, {
          rank: currentRank,
          color: player.color,
        });
      }
    }

    if (this.state.currentDiceValue === 6 && this.state.consecutiveSixes < 3) {
      extraTurnAwarded = true;
    }

    const activeUnfinishedPlayers = this.state.players.filter((p) => !p.hasFinished);
    const gameOver = activeUnfinishedPlayers.length <= 1;

    if (gameOver) {
      if (activeUnfinishedPlayers.length === 1) {
        const lastPlayer = activeUnfinishedPlayers[0];
        lastPlayer.hasFinished = true;
        lastPlayer.finishRank = this.state.rankings.length + 1;
        this.state.rankings.push({
          seatIndex: lastPlayer.seatIndex,
          color: lastPlayer.color,
          username: lastPlayer.username,
          rank: lastPlayer.finishRank,
        });
      }

      this.state.turnPhase = 'GAME_OVER';
      return {
        movedTokenId: tokenId,
        fromStep,
        toStep,
        capturedToken: validMove.capturesToken,
        extraTurn: false,
        playerFinished: playerFinishedNow,
        gameOver: true,
      };
    }

    if (extraTurnAwarded && !player.hasFinished) {
      this.state.turnPhase = 'ROLL_DICE';
      this.state.validMoves = [];
      this.state.currentDiceValue = null;
      this.state.turnStartTime = Date.now();
      this.recordEvent('EXTRA_TURN', seatIndex, {});
      return {
        movedTokenId: tokenId,
        fromStep,
        toStep,
        capturedToken: validMove.capturesToken,
        extraTurn: true,
        playerFinished: playerFinishedNow,
        gameOver: false,
      };
    }

    this.state.consecutiveSixes = 0;
    this.advanceTurn();

    return {
      movedTokenId: tokenId,
      fromStep,
      toStep,
      capturedToken: validMove.capturesToken,
      extraTurn: false,
      playerFinished: playerFinishedNow,
      gameOver: false,
    };
  }

  public advanceTurn(): void {
    const seats = this.state.activePlayerSeats;
    const currentIndex = seats.indexOf(this.state.currentTurnSeat);
    let nextIndex = (currentIndex + 1) % seats.length;
    let attempts = 0;

    while (attempts < seats.length) {
      const candidateSeat = seats[nextIndex];
      const player = this.state.players.find((p) => p.seatIndex === candidateSeat);
      if (player && !player.hasFinished) {
        // Clear shields from active player tokens on turn start
        for (const t of player.tokens) {
          t.isShielded = false;
        }

        this.state.currentTurnSeat = candidateSeat;
        this.state.turnPhase = 'ROLL_DICE';
        this.state.validMoves = [];
        this.state.currentDiceValue = null;
        this.state.turnStartTime = Date.now();
        this.recordEvent('TURN_PASSED', candidateSeat, {});
        return;
      }
      nextIndex = (nextIndex + 1) % seats.length;
      attempts++;
    }

    this.state.turnPhase = 'GAME_OVER';
  }

  public handleTurnTimeout(): { autoRolled: boolean; autoMoved: boolean } {
    if (this.state.turnPhase === 'ROLL_DICE') {
      const rollRes = this.rollDice(this.state.currentTurnSeat);
      if (rollRes.turnPassed) {
        return { autoRolled: true, autoMoved: false };
      }
      const player = this.getCurrentPlayer();
      const botMove = BotAI.selectMove('medium', rollRes.validMoves, player, this.state.players, this.state.rules);
      if (botMove) {
        this.moveToken(this.state.currentTurnSeat, botMove.tokenId);
        return { autoRolled: true, autoMoved: true };
      }
      this.advanceTurn();
      return { autoRolled: true, autoMoved: false };
    }

    if (this.state.turnPhase === 'SELECT_TOKEN' && this.state.validMoves.length > 0) {
      const player = this.getCurrentPlayer();
      const botMove = BotAI.selectMove('medium', this.state.validMoves, player, this.state.players, this.state.rules);
      if (botMove) {
        this.moveToken(this.state.currentTurnSeat, botMove.tokenId);
        return { autoRolled: false, autoMoved: true };
      }
    }

    this.advanceTurn();
    return { autoRolled: false, autoMoved: false };
  }

  public playBotTurn(difficulty: BotDifficulty = 'medium'): {
    rolledValue: number;
    movedTokenId: number | null;
    extraTurn: boolean;
    gameOver: boolean;
  } | null {
    const player = this.getCurrentPlayer();
    if (!player.isBot || this.state.turnPhase === 'GAME_OVER') {
      return null;
    }

    if (this.state.turnPhase === 'ROLL_DICE') {
      const rollResult = this.rollDice(player.seatIndex);
      if (rollResult.turnPassed || rollResult.validMoves.length === 0) {
        return {
          rolledValue: rollResult.diceValue,
          movedTokenId: null,
          extraTurn: false,
          gameOver: (this.state.turnPhase as any) === 'GAME_OVER',
        };
      }

      const selected = BotAI.selectMove(
        difficulty,
        rollResult.validMoves,
        player,
        this.state.players,
        this.state.rules
      );

      if (!selected) {
        this.advanceTurn();
        return null;
      }

      const moveRes = this.moveToken(player.seatIndex, selected.tokenId);
      return {
        rolledValue: rollResult.diceValue,
        movedTokenId: selected.tokenId,
        extraTurn: moveRes.extraTurn,
        gameOver: moveRes.gameOver,
      };
    }

    if (this.state.turnPhase === 'SELECT_TOKEN' && this.state.validMoves.length > 0) {
      const selected = BotAI.selectMove(
        difficulty,
        this.state.validMoves,
        player,
        this.state.players,
        this.state.rules
      );
      if (!selected) {
        this.advanceTurn();
        return null;
      }
      const moveRes = this.moveToken(player.seatIndex, selected.tokenId);
      return {
        rolledValue: this.state.currentDiceValue || 6,
        movedTokenId: selected.tokenId,
        extraTurn: moveRes.extraTurn,
        gameOver: moveRes.gameOver,
      };
    }

    return null;
  }

  public usePowerUp(
    seatIndex: number,
    powerUpType: 'REROLL' | 'MAGIC_SIX' | 'SHIELD',
    targetTokenId?: number
  ): { success: boolean; message: string; diceValue?: number; validMoves?: ValidMove[] } {
    if (this.state.turnPhase === 'GAME_OVER') {
      return { success: false, message: 'Game has already concluded.' };
    }

    if (seatIndex !== this.state.currentTurnSeat) {
      return { success: false, message: 'Can only use power-up on your own turn.' };
    }

    const player = this.getCurrentPlayer();
    if (!player) return { success: false, message: 'Player not found.' };

    if (!this.state.powerUpsUsed) {
      this.state.powerUpsUsed = {};
    }
    if (!this.state.powerUpsUsed[seatIndex]) {
      this.state.powerUpsUsed[seatIndex] = { reroll: 0, magicSix: 0, shield: 0 };
    }

    if (powerUpType === 'REROLL') {
      const newRoll = DiceRoller.roll();
      this.state.currentDiceValue = newRoll;
      this.state.turnPhase = 'SELECT_TOKEN';
      const moves = MoveValidator.getValidMoves(player, newRoll, this.state.players, this.state.rules);
      this.state.validMoves = moves;
      this.state.powerUpsUsed[seatIndex].reroll += 1;

      this.recordEvent('POWER_UP_USED', seatIndex, {
        powerUp: 'REROLL',
        newDiceValue: newRoll,
        validMovesCount: moves.length,
      });

      if (moves.length === 0) {
        this.advanceTurn();
        return {
          success: true,
          message: `Re-rolled ${newRoll}, but no moves available. Turn passed.`,
          diceValue: newRoll,
          validMoves: [],
        };
      }

      return { success: true, message: `Re-rolled a ${newRoll}!`, diceValue: newRoll, validMoves: moves };
    }

    if (powerUpType === 'MAGIC_SIX') {
      this.state.currentDiceValue = 6;
      this.state.turnPhase = 'SELECT_TOKEN';
      const moves = MoveValidator.getValidMoves(player, 6, this.state.players, this.state.rules);
      this.state.validMoves = moves;
      this.state.powerUpsUsed[seatIndex].magicSix += 1;

      this.recordEvent('POWER_UP_USED', seatIndex, {
        powerUp: 'MAGIC_SIX',
        diceValue: 6,
        validMovesCount: moves.length,
      });

      return { success: true, message: 'Magic Six activated! Roll set to 6.', diceValue: 6, validMoves: moves };
    }

    if (powerUpType === 'SHIELD') {
      const tokenId = targetTokenId !== undefined ? targetTokenId : player.tokens.find((t) => t.position.state === 'PATH')?.id;
      if (tokenId === undefined) {
        return { success: false, message: 'No active token on perimeter path to shield.' };
      }

      const targetToken = player.tokens.find((t) => t.id === tokenId);
      if (!targetToken || targetToken.position.state !== 'PATH') {
        return { success: false, message: 'Token must be on active perimeter path to shield.' };
      }

      targetToken.isShielded = true;
      this.state.powerUpsUsed[seatIndex].shield += 1;

      this.recordEvent('POWER_UP_USED', seatIndex, {
        powerUp: 'SHIELD',
        tokenId,
      });

      return { success: true, message: `Token ${tokenId + 1} is now shielded for 1 round!` };
    }

    return { success: false, message: 'Unknown power-up.' };
  }

  private recordEvent(type: GameEvent['type'], seatIndex: number, payload: any): void {
    this.state.history.push({
      type,
      seatIndex,
      payload,
      timestamp: Date.now(),
    });
  }

  public exportSnapshot(): string {
    return JSON.stringify(this.state);
  }

  public static importSnapshot(snapshotJson: string): LudoGame {
    const parsedState: GameState = JSON.parse(snapshotJson);
    const game = new LudoGame(parsedState.matchId, [], parsedState.rules);
    (game as any).state = parsedState;
    return game;
  }
}
