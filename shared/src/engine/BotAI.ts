import type { GameRules, Player, ValidMove } from '../types/game';
import { LudoBoard } from './LudoBoard';
import { PathCalculator } from './PathCalculator';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export class BotAI {
  public static selectMove(
    difficulty: BotDifficulty,
    validMoves: ValidMove[],
    player: Player,
    allPlayers: Player[],
    rules: GameRules
  ): ValidMove | null {
    if (validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    switch (difficulty) {
      case 'easy':
        return this.selectEasyMove(validMoves);
      case 'medium':
        return this.selectMediumMove(validMoves);
      case 'hard':
      default:
        return this.selectHardMove(validMoves, player, allPlayers, rules);
    }
  }

  private static selectEasyMove(validMoves: ValidMove[]): ValidMove {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  private static selectMediumMove(validMoves: ValidMove[]): ValidMove {
    const finishMove = validMoves.find((m) => m.isFinish);
    if (finishMove) return finishMove;

    const captureMove = validMoves.find((m) => m.capturesToken !== null);
    if (captureMove) return captureMove;

    const safeMove = validMoves.find((m) => {
      if (m.toStep > PathCalculator.PERIMETER_MAX_STEP) return false;
      const destIndex = PathCalculator.stepToPerimeterIndex('RED', m.toStep);
      return destIndex !== null && LudoBoard.isSafeCell(destIndex);
    });
    if (safeMove) return safeMove;

    const entryMove = validMoves.find((m) => m.isEntry);
    if (entryMove) return entryMove;

    return validMoves.reduce((best, curr) => (curr.toStep > best.toStep ? curr : best), validMoves[0]);
  }

  private static selectHardMove(
    validMoves: ValidMove[],
    player: Player,
    allPlayers: Player[],
    rules: GameRules
  ): ValidMove {
    let bestMove = validMoves[0];
    let highestScore = -Infinity;

    for (const move of validMoves) {
      let score = 0;

      if (move.isFinish) {
        score += 1000;
      }

      if (move.capturesToken) {
        score += 500;
        const capturedOpponent = allPlayers.find((p) => p.color === move.capturesToken?.color);
        const opponentToken = capturedOpponent?.tokens.find((t) => t.id === move.capturesToken?.tokenId);
        if (opponentToken && opponentToken.position.step > 20) {
          score += opponentToken.position.step * 5;
        }
      }

      if (move.fromStep <= PathCalculator.PERIMETER_MAX_STEP && move.toStep > PathCalculator.PERIMETER_MAX_STEP) {
        score += 200;
      }

      if (move.toStep <= PathCalculator.PERIMETER_MAX_STEP) {
        const destPerimeter = PathCalculator.stepToPerimeterIndex(player.color, move.toStep);
        if (destPerimeter !== null && LudoBoard.isSafeCell(destPerimeter)) {
          score += 180;
        }
      }

      if (move.fromStep >= 0 && move.fromStep <= PathCalculator.PERIMETER_MAX_STEP) {
        const currentPerimeter = PathCalculator.stepToPerimeterIndex(player.color, move.fromStep);
        if (currentPerimeter !== null && !LudoBoard.isSafeCell(currentPerimeter)) {
          if (this.isCellThreatened(currentPerimeter, player, allPlayers)) {
            score += 250;
          }
        }
      }

      if (move.isEntry) {
        const activeTokensInPlay = player.tokens.filter(
          (t) => t.position.state === 'PATH' || t.position.state === 'HOME_STRETCH'
        ).length;
        score += activeTokensInPlay === 0 ? 300 : 120;
      }

      if (move.toStep <= PathCalculator.PERIMETER_MAX_STEP) {
        const destPerimeter = PathCalculator.stepToPerimeterIndex(player.color, move.toStep);
        if (destPerimeter !== null && !LudoBoard.isSafeCell(destPerimeter)) {
          if (this.isCellThreatened(destPerimeter, player, allPlayers)) {
            score -= 220;
          }
        }
      }

      score += move.toStep * 2;

      if (score > highestScore) {
        highestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private static isCellThreatened(perimeterIndex: number, player: Player, allPlayers: Player[]): boolean {
    for (const opponent of allPlayers) {
      if (opponent.color === player.color) continue;
      if (player.teamId !== null && opponent.teamId === player.teamId) continue;

      for (const opToken of opponent.tokens) {
        if (opToken.position.state !== 'PATH' || opToken.position.perimeterIndex === null) continue;

        const distanceBehind = (perimeterIndex - opToken.position.perimeterIndex + 52) % 52;
        if (distanceBehind >= 1 && distanceBehind <= 6) {
          return true;
        }
      }
    }
    return false;
  }
}
