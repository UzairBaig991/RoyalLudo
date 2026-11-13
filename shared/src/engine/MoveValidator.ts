import type { GameRules, Player, ValidMove } from '../types/game';
import { LudoBoard } from './LudoBoard';
import { PathCalculator } from './PathCalculator';

export class MoveValidator {
  /**
   * Determine all legal moves for a given player and dice roll.
   */
  public static getValidMoves(
    player: Player,
    diceValue: number,
    allPlayers: Player[],
    rules: GameRules
  ): ValidMove[] {
    const validMoves: ValidMove[] = [];

    for (const token of player.tokens) {
      if (token.position.state === 'FINISHED' || token.position.step >= PathCalculator.FINISH_STEP) {
        continue;
      }

      const fromStep = token.position.step;
      let targetStep = PathCalculator.calculateNextStep(
        fromStep,
        diceValue,
        rules.openOnSix,
        rules.openOnOne
      );

      if (targetStep < 0) {
        continue;
      }

      // Authentic Ludo Star Kill Requirement:
      // If player has not captured an opponent, they cannot enter the colored home corridor (steps 51..56).
      if (rules.mustKillToEnterHome && !player.hasKilledOpponent && targetStep > PathCalculator.PERIMETER_MAX_STEP) {
        if (rules.loopIfNoKill && fromStep <= PathCalculator.PERIMETER_MAX_STEP) {
          // Token loops around the outer track to continue hunting opponents!
          targetStep = (fromStep + diceValue) % 52;
        } else if (!rules.loopIfNoKill) {
          continue; // Blocked from entering home corridor
        }
      }

      if (rules.allowStacking && this.isBlockedByOpponentStack(player, fromStep, targetStep, allPlayers)) {
        continue;
      }

      let capturesToken: ValidMove['capturesToken'] = null;

      if (targetStep <= PathCalculator.PERIMETER_MAX_STEP) {
        const destPerimeterIndex = PathCalculator.stepToPerimeterIndex(player.color, targetStep);

        if (destPerimeterIndex !== null) {
          const isSafeCell = rules.safeCellCoexistence && LudoBoard.isSafeCell(destPerimeterIndex);

          if (!isSafeCell) {
            for (const otherPlayer of allPlayers) {
              if (otherPlayer.color === player.color) continue;
              if (player.teamId !== null && otherPlayer.teamId === player.teamId) continue;

              const opponentToken = otherPlayer.tokens.find(
                (t) => t.position.state === 'PATH' && t.position.perimeterIndex === destPerimeterIndex
              );

              if (opponentToken) {
                capturesToken = {
                  color: otherPlayer.color,
                  tokenId: opponentToken.id,
                  seatIndex: otherPlayer.seatIndex,
                };
                break;
              }
            }
          }
        }
      }

      validMoves.push({
        tokenId: token.id,
        fromStep,
        toStep: targetStep,
        isEntry: fromStep === -1 && targetStep === 0,
        isFinish: targetStep === PathCalculator.FINISH_STEP,
        capturesToken,
      });
    }

    return validMoves;
  }

  private static isBlockedByOpponentStack(
    player: Player,
    fromStep: number,
    toStep: number,
    allPlayers: Player[]
  ): boolean {
    const startStep = fromStep < 0 ? 0 : fromStep + 1;

    for (let step = startStep; step <= toStep && step <= PathCalculator.PERIMETER_MAX_STEP; step++) {
      const perimeterIndex = PathCalculator.stepToPerimeterIndex(player.color, step);
      if (perimeterIndex === null) continue;

      for (const opponent of allPlayers) {
        if (opponent.color === player.color) continue;
        if (player.teamId !== null && opponent.teamId === player.teamId) continue;

        const countOnCell = opponent.tokens.filter(
          (t) => t.position.state === 'PATH' && t.position.perimeterIndex === perimeterIndex
        ).length;

        if (countOnCell >= 2) {
          return true;
        }
      }
    }

    return false;
  }
}
