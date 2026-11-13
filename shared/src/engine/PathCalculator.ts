import { COLOR_START_INDEX } from '../constants/board';
import type { PlayerColor } from '../types/game';

export class PathCalculator {
  public static readonly TOTAL_PATH_STEPS = 56;
  public static readonly FINISH_STEP = 56;
  public static readonly START_STEP = 0;
  public static readonly HOME_STRETCH_START_STEP = 51;
  public static readonly PERIMETER_MAX_STEP = 50;

  /**
   * Calculate destination step given a current step and dice roll.
   * Returns -1 if move is impossible/overshoots.
   */
  public static calculateNextStep(currentStep: number, diceRoll: number, openOnSix = true, openOnOne = false): number {
    if (currentStep < 0) {
      if ((diceRoll === 6 && openOnSix) || (diceRoll === 1 && openOnOne)) {
        return this.START_STEP;
      }
      return -1;
    }

    const targetStep = currentStep + diceRoll;

    if (targetStep > this.FINISH_STEP) {
      return -1;
    }

    return targetStep;
  }

  /**
   * Convert a player's step (0..50) to the absolute board perimeter index (0..51)
   */
  public static stepToPerimeterIndex(color: PlayerColor, step: number): number | null {
    if (step < 0 || step > this.PERIMETER_MAX_STEP) {
      return null;
    }
    const startIndex = COLOR_START_INDEX[color];
    return (startIndex + step) % 52;
  }

  /**
   * Convert an absolute perimeter index (0..51) to a player's relative step (0..50), or null if not on perimeter path
   */
  public static perimeterIndexToStep(color: PlayerColor, perimeterIndex: number): number {
    const startIndex = COLOR_START_INDEX[color];
    return (perimeterIndex - startIndex + 52) % 52;
  }
}
