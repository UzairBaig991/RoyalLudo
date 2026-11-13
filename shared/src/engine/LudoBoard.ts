import {
  COLOR_BASE_SLOTS,
  COLOR_FINISH_COORDINATES,
  COLOR_HOME_ENTRY_INDEX,
  COLOR_HOME_STRETCH_COORDINATES,
  COLOR_SEAT_ORDER,
  COLOR_START_INDEX,
  PERIMETER_COORDINATES,
  SAFE_PERIMETER_INDICES,
} from '../constants/board';
import type { GridCoord, PlayerColor, TokenPosition, TokenState } from '../types/game';

export class LudoBoard {
  /**
   * Check if a given perimeter index is one of the 8 safe cells
   */
  public static isSafeCell(perimeterIndex: number): boolean {
    return SAFE_PERIMETER_INDICES.includes(perimeterIndex);
  }

  /**
   * Get the start perimeter index for a color (0, 13, 26, 39)
   */
  public static getStartPerimeterIndex(color: PlayerColor): number {
    return COLOR_START_INDEX[color];
  }

  /**
   * Get the perimeter index right before entering the home stretch
   */
  public static getHomeEntryPerimeterIndex(color: PlayerColor): number {
    return COLOR_HOME_ENTRY_INDEX[color];
  }

  /**
   * Resolve logical step (from -1 to 56) to board (row, col) grid coordinate
   */
  public static resolveGridCoordinate(color: PlayerColor, tokenId: number, step: number): GridCoord {
    if (step < 0) {
      return COLOR_BASE_SLOTS[color][tokenId];
    }

    if (step >= 0 && step <= 50) {
      const perimeterIndex = (COLOR_START_INDEX[color] + step) % 52;
      return PERIMETER_COORDINATES[perimeterIndex];
    }

    if (step >= 51 && step <= 55) {
      const homeIndex = step - 51;
      return COLOR_HOME_STRETCH_COORDINATES[color][homeIndex];
    }

    return COLOR_FINISH_COORDINATES[color];
  }

  /**
   * Build a complete TokenPosition object given color, tokenId, and step
   */
  public static createTokenPosition(color: PlayerColor, tokenId: number, step: number): TokenPosition {
    if (step < 0) {
      return {
        state: 'BASE',
        step: -1,
        perimeterIndex: null,
        homeStretchIndex: null,
        gridCoord: COLOR_BASE_SLOTS[color][tokenId],
      };
    }

    if (step <= 50) {
      const perimeterIndex = (COLOR_START_INDEX[color] + step) % 52;
      return {
        state: 'PATH',
        step,
        perimeterIndex,
        homeStretchIndex: null,
        gridCoord: PERIMETER_COORDINATES[perimeterIndex],
      };
    }

    if (step <= 55) {
      const homeStretchIndex = step - 51;
      return {
        state: 'HOME_STRETCH',
        step,
        perimeterIndex: null,
        homeStretchIndex,
        gridCoord: COLOR_HOME_STRETCH_COORDINATES[color][homeStretchIndex],
      };
    }

    return {
      state: 'FINISHED',
      step: 56,
      perimeterIndex: null,
      homeStretchIndex: null,
      gridCoord: COLOR_FINISH_COORDINATES[color],
    };
  }

  /**
   * Check if a color starts at a given seat
   */
  public static getColorForSeat(seatIndex: number): PlayerColor {
    return COLOR_SEAT_ORDER[seatIndex % 4];
  }
}
